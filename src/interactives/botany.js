import renderMathInElement from "katex/contrib/auto-render";
import Chart from "chart.js/auto";

function renderBotanyLatex(container) {
  renderMathInElement(container, {
    delimiters: [{ left: "\\(", right: "\\)", display: false }],
    throwOnError: false,
  });
}

function renderBotanyInteractive() {
  const charts = [];
  const sharedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        grid: { color: "rgba(99, 102, 241, 0.15)" },
        ticks: { color: "#4338ca", maxTicksLimit: 5, font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(99, 102, 241, 0.15)" },
        ticks: { color: "#4338ca", maxTicksLimit: 5, font: { size: 10 } },
      },
    },
  };

  function makeChart(id, type, label, labels = []) {
    const canvas = document.getElementById(id);
    if (!canvas) {
      return null;
    }

    const chart = new Chart(canvas, {
      type,
      data: {
        labels,
        datasets: [
          {
            data: [],
            label,
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79, 70, 229, 0.24)",
            borderWidth: 2,
            fill: type === "line",
            tension: 0.35,
          },
        ],
      },
      options: sharedOptions,
    });

    charts.push(chart);
    return chart;
  }

  function num(id) {
    const value = Number(document.getElementById(id)?.value);
    return Number.isFinite(value) ? value : 0;
  }

  function setResult(id, content) {
    const node = document.getElementById(id);
    if (node) {
      node.innerHTML = content;
    }
  }

  function drawVisual(id, drawFn) {
    const canvas = document.getElementById(id);
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const width = canvas.clientWidth || 320;
    const height = canvas.clientHeight || 150;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    drawFn(ctx, width, height);
  }

  function drawPlantVisual(id, vitality, stemHeight = 0.72) {
    drawVisual(id, (ctx, width, height) => {
      const safeVitality = Math.min(1, Math.max(0, vitality));
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#ecfeff");
      sky.addColorStop(1, "#f0fdf4");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const groundY = height - 20;
      ctx.fillStyle = "#bbf7d0";
      ctx.fillRect(0, groundY, width, height - groundY);

      const centerX = width / 2;
      const stemTopY = Math.max(20, groundY - Math.max(35, stemHeight * (height - 45)));
      ctx.strokeStyle = "#166534";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(centerX, groundY);
      ctx.lineTo(centerX, stemTopY);
      ctx.stroke();

      const leafCount = Math.max(2, Math.round(2 + safeVitality * 8));
      for (let i = 0; i < leafCount; i += 1) {
        const side = i % 2 === 0 ? -1 : 1;
        const progress = i / Math.max(leafCount - 1, 1);
        const y = groundY - 18 - progress * (groundY - stemTopY - 12);
        const size = 10 + safeVitality * 6;

        ctx.fillStyle = `rgba(22, 163, 74, ${0.4 + safeVitality * 0.55})`;
        ctx.beginPath();
        ctx.ellipse(centerX + side * (14 + progress * 11), y, size * 0.8, size * 0.48, side * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }

      const flowerRadius = 3 + safeVitality * 6;
      ctx.fillStyle = safeVitality > 0.7 ? "#facc15" : "#4ade80";
      ctx.beginPath();
      ctx.arc(centerX, stemTopY, flowerRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  }



  function syncPairedInputs(scope) {
    scope.querySelectorAll("input[data-sync-key]").forEach((input) => {
      input.addEventListener("input", () => {
        const key = input.dataset.syncKey;
        if (!key) {
          return;
        }

        scope.querySelectorAll(`input[data-sync-key="${key}"]`).forEach((match) => {
          if (match !== input) {
            match.value = input.value;
          }
        });
      });
    });
  }

  const photoChart = makeChart("botany-plot-1", "line", "A(I)");
  const rgrChart = makeChart("botany-plot-2", "line", "Biomass");
  const wueChart = makeChart("botany-plot-3", "bar", "WUE", ["Plant A", "Plant B", "Plant C"]);
  const laiChart = makeChart("botany-plot-4", "bar", "LAI", ["Plot 1", "Plot 2", "Plot 3"]);
  const transpirationChart = makeChart("botany-plot-5", "line", "Transpiration");
  const gddChart = makeChart("botany-plot-6", "line", "Cumulative GDD");

  function updatePhotosynthesis() {
    const aMax = num("photo-amax");
    const k = num("photo-k");
    const iTarget = num("photo-i");
    const labels = [0, 100, 250, 500, 750, 1000];
    const values = labels.map((light) => aMax * (1 - Math.exp(-k * light)));
    const result = aMax * (1 - Math.exp(-k * iTarget));

    if (photoChart) {
      photoChart.data.labels = labels;
      photoChart.data.datasets[0].data = values;
      photoChart.update();
    }

    drawPlantVisual("botany-visual-1", Math.min(result / Math.max(aMax, 1), 1), 0.72);
    setResult("botany-result-1", `A(${iTarget}) = <strong>${result.toFixed(2)} μmol CO₂ m⁻² s⁻¹</strong>`);
  }

  function updateRgr() {
    const w1 = Math.max(num("rgr-w1"), 0.001);
    const w2 = Math.max(num("rgr-w2"), 0.001);
    const t1 = num("rgr-t1");
    const t2 = num("rgr-t2");
    const totalDays = Math.max(t2 - t1, 1);
    const rgr = (Math.log(w2) - Math.log(w1)) / totalDays;
    const points = Math.min(Math.max(Math.round(totalDays), 2), 20);
    const labels = Array.from({ length: points + 1 }, (_, index) => t1 + index * (totalDays / points));
    const values = labels.map((day) => w1 * Math.exp(rgr * (day - t1)));

    if (rgrChart) {
      rgrChart.data.labels = labels.map((value) => value.toFixed(1));
      rgrChart.data.datasets[0].data = values;
      rgrChart.update();
    }

    drawPlantVisual("botany-visual-2", Math.min(Math.max((rgr + 0.05) / 0.2, 0), 1), 0.78);
    setResult("botany-result-2", `RGR = <strong>${rgr.toFixed(4)} day⁻¹</strong> over ${totalDays.toFixed(1)} days`);
  }

  function updateWue() {
    const a = num("wue-a");
    const e = Math.max(num("wue-e"), 0.001);
    const wue = a / e;
    if (wueChart) {
      wueChart.data.datasets[0].data = [Math.max(wue - 0.4, 0), wue, wue + 0.4];
      wueChart.update();
    }
    drawPlantVisual("botany-visual-3", Math.min(wue / 6, 1), 0.66);
    setResult("botany-result-3", `WUE = <strong>${wue.toFixed(2)} μmol CO₂ per mmol H₂O</strong>`);
  }

  function updateLai() {
    const leafArea = num("lai-leaf-area");
    const groundArea = Math.max(num("lai-ground-area"), 0.001);
    const lai = leafArea / groundArea;
    if (laiChart) {
      laiChart.data.datasets[0].data = [Math.max(lai - 1.2, 0), lai, lai + 1.2];
      laiChart.update();
    }
    drawPlantVisual("botany-visual-4", Math.min(lai / 6, 1), 0.7);
    setResult("botany-result-4", `LAI = <strong>${lai.toFixed(2)} m² leaf per m² ground</strong>`);
  }

  function updateTranspiration() {
    const gs = num("transpiration-gs");
    const vpd = num("transpiration-vpd");
    const e = gs * vpd;
    const labels = [0.5, 1.0, 1.5, 2.0, 2.5];
    const values = labels.map((value) => gs * value);
    if (transpirationChart) {
      transpirationChart.data.labels = labels;
      transpirationChart.data.datasets[0].data = values;
      transpirationChart.update();
    }
    drawPlantVisual("botany-visual-5", Math.min(Math.max(1 - vpd / 4.2, 0), 1), 0.68);
    setResult("botany-result-5", `E = <strong>${e.toFixed(2)}</strong> at VPD = ${vpd.toFixed(2)} kPa`);
  }

  function updateGdd() {
    const baseTemp = num("gdd-base");
    const dailyTemps = [1, 2, 3, 4, 5].map((index) => num(`gdd-day-${index}`));
    let cumulative = 0;
    const cumulativeValues = dailyTemps.map((temp) => {
      cumulative += Math.max(0, temp - baseTemp);
      return cumulative;
    });
    if (gddChart) {
      gddChart.data.labels = [1, 2, 3, 4, 5];
      gddChart.data.datasets[0].data = cumulativeValues;
      gddChart.update();
    }
    drawPlantVisual("botany-visual-6", Math.min(cumulative / 45, 1), 0.8);
    setResult("botany-result-6", `Total GDD = <strong>${cumulative.toFixed(2)} degree-days</strong>`);
  }

  function updateTreeVisual() {
    const heightMeters = Math.max(num("tree-height"), 1);
    const canopyRadius = Math.max(num("tree-canopy-radius"), 0.4);
    const branchDensity = Math.max(num("tree-branch-density"), 1);
    const leafCoverage = Math.max(num("tree-leaf-coverage"), 0.2);

    const canopyVolume = ((4 / 3) * Math.PI * canopyRadius ** 3) / 2;
    const trunkDbhCm = (heightMeters * canopyRadius * 3.4).toFixed(1);

    drawVisual("botany-visual-7", (ctx, width, height) => {
      const groundY = height - 18;
      const trunkTopY = Math.max(24, groundY - heightMeters * 4.6);
      const trunkWidth = Math.max(8, Math.min(22, heightMeters * 0.75));
      const canopyCenterY = trunkTopY + 14;
      const canopyRx = Math.max(32, Math.min(width * 0.32, canopyRadius * 16));
      const canopyRy = Math.max(24, Math.min(height * 0.24, canopyRadius * 10));

      ctx.fillStyle = "#bbf7d0";
      ctx.fillRect(0, groundY, width, height - groundY);

      ctx.fillStyle = "#a16207";
      ctx.fillRect(width / 2 - trunkWidth / 2, trunkTopY, trunkWidth, groundY - trunkTopY);

      for (let i = 0; i < branchDensity; i += 1) {
        const offset = i - (branchDensity - 1) / 2;
        const y = trunkTopY + 10 + i * 6;
        const length = 18 + Math.abs(offset) * 6;

        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2, y);
        ctx.lineTo(width / 2 + Math.sign(offset || 1) * length, y - 6 - Math.abs(offset) * 2);
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(22, 163, 74, ${Math.min(0.95, 0.3 + leafCoverage * 0.4)})`;
      ctx.beginPath();
      ctx.ellipse(width / 2, canopyCenterY, canopyRx, canopyRy, 0, 0, Math.PI * 2);
      ctx.fill();

      const leafCount = Math.round(30 + leafCoverage * 35);
      ctx.fillStyle = "rgba(34, 197, 94, 0.85)";
      for (let i = 0; i < leafCount; i += 1) {
        const angle = (i / leafCount) * Math.PI * 2;
        const radiusX = canopyRx * (0.28 + ((i * 37) % 71) / 100);
        const radiusY = canopyRy * (0.25 + ((i * 53) % 67) / 100);
        const x = width / 2 + Math.cos(angle) * radiusX;
        const y = canopyCenterY + Math.sin(angle) * radiusY;
        ctx.fillRect(x, y, 2.5, 2.5);
      }
    });

    setResult(
      "botany-result-7",
      `Estimated canopy volume <strong>${canopyVolume.toFixed(1)} m³</strong> · Approx trunk DBH <strong>${trunkDbhCm} cm</strong>`,
    );
  }

  const actions = [
    ["botany-example-1", updatePhotosynthesis],
    ["botany-example-2", updateRgr],
    ["botany-example-3", updateWue],
    ["botany-example-4", updateLai],
    ["botany-example-5", updateTranspiration],
    ["botany-example-6", updateGdd],
    ["botany-example-7", updateTreeVisual],
  ];

  actions.forEach(([formId, updateFn]) => {
    const form = document.getElementById(formId);
    if (!form) {
      return;
    }

    syncPairedInputs(form);
    form.addEventListener("input", updateFn);
    form.addEventListener("submit", (event) => event.preventDefault());
    updateFn();
  });

  return () => {
    charts.forEach((chart) => chart.destroy());
  };
}

export { renderBotanyInteractive, renderBotanyLatex };
