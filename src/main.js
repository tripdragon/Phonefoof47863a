import "./style.css";
import "katex/dist/katex.min.css";
import renderMathInElement from "katex/contrib/auto-render";
import Chart from "chart.js/auto";
import { renderShowsSection } from "./shows/controller";
import { createShowsStore } from "./shows/store";
import { renderThreeDemoRoute } from "./three-demo/scene";
import { renderSuperneatDemoRoute } from "./three-demo/superneat-scene";
import { renderSentenceStructureAnalysis } from "./sentence-structure";

const appVersion = `v${__APP_VERSION__}`;

document.querySelector("#app").innerHTML = `
  <main>
    <section class="hero" aria-live="polite" id="home-section">
      <nav class="menu" aria-label="Primary">
        <div class="brand-wrap">
          <span class="brand">Phonefoof</span>
          <span class="version" aria-label="Application version">${appVersion}</span>
        </div>
        <ul class="menu-list">
          <li><a class="menu-link" data-route="/" href="#/">Home</a></li>
          <li><a class="menu-link" data-route="/piano" href="#/piano">Piano</a></li>
          <li><a class="menu-link" data-route="/shows" href="#/shows">Shows</a></li>
          <li><a class="menu-link" data-route="/shows-crud" href="#/shows-crud">Shows CRUD</a></li>
          <li><a class="menu-link" data-route="/botany" href="#/botany">Botany</a></li>
          <li><a class="menu-link" data-route="/camera" href="#/camera">Camera</a></li>
          <li><a class="menu-link" data-route="/recursion-tree" href="#/recursion-tree">Recursion Tree</a></li>
          <li><a class="menu-link" data-route="/three-demo" href="#/three-demo">Three.js Demo</a></li>
          <li><a class="menu-link" data-route="/three-superneat" href="#/three-superneat">Three.js SuperNeat</a></li>
<li><a class="menu-link" data-route="/bunnyblast-full" href="bunnyblast-full.html">claude1</a></li>
<li><a class="menu-link" data-route="/learn-univers_1" href="learn-univers_1.html">learn uni 1</a></li>
<li><a class="menu-link" data-route="/claude-game-1" href="claude-game-1.html">claude game 1</a></li>


          
        </ul>
      </nav>
      <div id="route-content"></div>
    </section>
    <section class="hero-showcase" aria-label="Product highlight">
      <div class="hero-showcase__content">
        <p class="hero-showcase__kicker">Always on, always synced</p>
        <h2 class="hero-showcase__title">A better command center for every conversation.</h2>
        <p class="hero-showcase__subtitle">
          From real-time call monitoring to actionable summaries, Phonefoof keeps your whole team aligned with clarity and style.
        </p>
      </div>
      <div class="hero-showcase__glow" aria-hidden="true"></div>
    </section>
  </main>
`;

const slides = [
  {
    kicker: "Phonefoof App",
    title: "Manage your calls from one clean workspace",
    subtitle: "Track call history, monitor response times, and stay synced with your team in real time.",
  },
  {
    kicker: "Docker-ready",
    title: "Launch in seconds with NGINX + Docker Compose",
    subtitle: "Run <code>docker compose up --build</code> and open <code>http://localhost:8080</code>.",
  },
  {
    kicker: "Shows Tracker",
    title: "Organize what you watch with local persistence",
    subtitle: "Use the new shows section to create, update, and remove your favorite titles.",
  },
];

const routeContent = document.getElementById("route-content");
let activeRouteCleanup = null;

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

function renderCameraInteractive() {
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

  function drawFovVisual(fov) {
    drawVisual("camera-visual-1", (ctx, width, height) => {
      const centerX = width / 2;
      const centerY = height - 16;
      const radius = Math.min(width * 0.44, height * 0.9);
      const halfAngle = (Math.min(Math.max(fov, 10), 170) * Math.PI) / 360;

      ctx.fillStyle = "rgba(79, 70, 229, 0.18)";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, -Math.PI / 2 - halfAngle, -Math.PI / 2 + halfAngle);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#4338ca";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX - Math.sin(halfAngle) * radius, centerY - Math.cos(halfAngle) * radius);
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.sin(halfAngle) * radius, centerY - Math.cos(halfAngle) * radius);
      ctx.stroke();

      ctx.fillStyle = "#1e1b4b";
      ctx.font = "600 12px system-ui";
      ctx.fillText(`FOV ${fov.toFixed(1)}°`, 10, 18);
    });
  }

  function drawApertureVisual(fNumber, shutter, iso) {
    drawVisual("camera-visual-2", (ctx, width, height) => {
      const normalizedAperture = Math.max(0.12, Math.min(0.95, 1 / fNumber));
      const apertureRadius = normalizedAperture * Math.min(width, height) * 0.3;
      const brightness = Math.min(1, (1 / (fNumber * fNumber)) * (shutter / 0.0167) * (iso / 100));
      const glow = Math.round(55 + brightness * 200);

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = `rgba(250, 204, 21, ${(0.2 + brightness * 0.7).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, apertureRadius * 1.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgb(${glow}, ${glow}, ${glow})`;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, apertureRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "600 12px system-ui";
      ctx.fillText(`f/${fNumber.toFixed(1)} • ${(shutter * 1000).toFixed(1)}ms • ISO ${iso.toFixed(0)}`, 10, 18);
    });
  }

  function drawDofVisual(subjectDistance, nearMeters, farMeters) {
    drawVisual("camera-visual-3", (ctx, width, height) => {
      const maxDistance = Math.max(subjectDistance * 1.8, Number.isFinite(farMeters) ? farMeters * 1.1 : subjectDistance * 2.2, 6);
      const toX = (meters) => 18 + (Math.min(meters, maxDistance) / maxDistance) * (width - 36);
      const lineY = height * 0.65;

      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(18, lineY);
      ctx.lineTo(width - 18, lineY);
      ctx.stroke();

      const nearX = toX(nearMeters);
      const subjectX = toX(subjectDistance);
      const farX = Number.isFinite(farMeters) ? toX(farMeters) : width - 24;

      ctx.fillStyle = "rgba(79, 70, 229, 0.25)";
      ctx.fillRect(nearX, lineY - 18, Math.max(farX - nearX, 4), 36);

      ctx.fillStyle = "#4f46e5";
      ctx.beginPath();
      ctx.arc(subjectX, lineY, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1e1b4b";
      ctx.font = "600 11px system-ui";
      ctx.fillText(`Near ${nearMeters.toFixed(2)}m`, Math.max(10, nearX - 20), lineY - 24);
      ctx.fillText(`Subject ${subjectDistance.toFixed(2)}m`, Math.max(10, subjectX - 28), lineY + 28);
      ctx.fillText(Number.isFinite(farMeters) ? `Far ${farMeters.toFixed(2)}m` : "Far ∞", Math.max(10, farX - 20), lineY - 24);
    });
  }

  function drawCropVisual(focalLength, equivalent) {
    drawVisual("camera-visual-4", (ctx, width, height) => {
      const maxValue = Math.max(equivalent, focalLength, 1);
      const leftHeight = (focalLength / maxValue) * (height - 40);
      const rightHeight = (equivalent / maxValue) * (height - 40);
      const baseY = height - 18;

      ctx.fillStyle = "rgba(79, 70, 229, 0.3)";
      ctx.fillRect(width * 0.2, baseY - leftHeight, width * 0.18, leftHeight);

      ctx.fillStyle = "rgba(79, 70, 229, 0.7)";
      ctx.fillRect(width * 0.6, baseY - rightHeight, width * 0.18, rightHeight);

      ctx.fillStyle = "#1e1b4b";
      ctx.font = "600 12px system-ui";
      ctx.fillText(`${focalLength.toFixed(0)}mm`, width * 0.18, baseY + 14);
      ctx.fillText(`${equivalent.toFixed(0)}mm eq`, width * 0.56, baseY + 14);
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

  const fovChart = makeChart("camera-plot-1", "line", "Horizontal FOV (deg)");
  const exposureChart = makeChart("camera-plot-2", "line", "Relative Light");
  const dofChart = makeChart("camera-plot-3", "line", "Depth of Field (m)");
  const cropChart = makeChart("camera-plot-4", "bar", "Equivalent Focal Length", ["Native", "35mm Eq"]);

  function updateFov() {
    const sensorWidth = Math.max(num("fov-sensor-width"), 1);
    const focalLength = Math.max(num("fov-focal-length"), 1);
    const fov = (2 * Math.atan(sensorWidth / (2 * focalLength)) * 180) / Math.PI;
    const labels = [14, 18, 24, 35, 50, 85];
    const values = labels.map((focal) => (2 * Math.atan(sensorWidth / (2 * focal)) * 180) / Math.PI);

    if (fovChart) {
      fovChart.data.labels = labels;
      fovChart.data.datasets[0].data = values;
      fovChart.update();
    }

    setResult("camera-result-1", `Horizontal FOV ≈ <strong>${fov.toFixed(1)}°</strong>`);
    drawFovVisual(fov);
  }

  function updateAperture() {
    const fNumber = Math.max(num("aperture-f-number"), 0.7);
    const shutter = Math.max(num("aperture-shutter"), 0.0005);
    const iso = Math.max(num("aperture-iso"), 50);
    const relativeLight = 1 / (fNumber * fNumber);
    const exposureValue100 = Math.log2((fNumber * fNumber) / shutter);
    const exposureValue = exposureValue100 - Math.log2(iso / 100);

    if (exposureChart) {
      const labels = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16];
      exposureChart.data.labels = labels;
      exposureChart.data.datasets[0].data = labels.map((stop) => 1 / (stop * stop));
      exposureChart.update();
    }

    setResult(
      "camera-result-2",
      `Relative light from aperture ≈ <strong>${relativeLight.toFixed(3)}</strong>; EV ≈ <strong>${exposureValue.toFixed(2)}</strong>`,
    );
    drawApertureVisual(fNumber, shutter, iso);
  }

  function updateDof() {
    const focalLength = Math.max(num("dof-focal"), 1);
    const fNumber = Math.max(num("dof-f-number"), 1);
    const subjectDistance = Math.max(num("dof-distance"), 0.2);
    const coc = Math.max(num("dof-coc"), 0.005);
    const f = focalLength;
    const s = subjectDistance * 1000;
    const hyperfocal = (f * f) / (fNumber * coc) + f;
    const near = (hyperfocal * s) / (hyperfocal + (s - f));
    const far = hyperfocal > s ? (hyperfocal * s) / (hyperfocal - (s - f)) : Infinity;
    const dof = far === Infinity ? Infinity : Math.max(far - near, 0);

    if (dofChart) {
      const labels = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16];
      dofChart.data.labels = labels;
      dofChart.data.datasets[0].data = labels.map((stop) => {
        const h = (f * f) / (stop * coc) + f;
        const n = (h * s) / (h + (s - f));
        const ff = h > s ? (h * s) / (h - (s - f)) : Infinity;
        return ff === Infinity ? null : (ff - n) / 1000;
      });
      dofChart.update();
    }

    const farText = far === Infinity ? "∞" : `${(far / 1000).toFixed(2)} m`;
    const dofText = dof === Infinity ? "∞" : `${(dof / 1000).toFixed(2)} m`;
    setResult(
      "camera-result-3",
      `Near ≈ <strong>${(near / 1000).toFixed(2)} m</strong>, Far ≈ <strong>${farText}</strong>, DOF ≈ <strong>${dofText}</strong>`,
    );
    drawDofVisual(subjectDistance, near / 1000, far === Infinity ? Infinity : far / 1000);
  }

  function updateCropFactor() {
    const focalLength = Math.max(num("crop-focal"), 1);
    const cropFactor = Math.max(num("crop-factor"), 0.5);
    const equivalent = focalLength * cropFactor;

    if (cropChart) {
      cropChart.data.datasets[0].data = [focalLength, equivalent];
      cropChart.update();
    }

    setResult("camera-result-4", `35mm equivalent focal length ≈ <strong>${equivalent.toFixed(1)} mm</strong>`);
    drawCropVisual(focalLength, equivalent);
  }

  const actions = [
    ["camera-example-1", updateFov],
    ["camera-example-2", updateAperture],
    ["camera-example-3", updateDof],
    ["camera-example-4", updateCropFactor],
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCurrentRoute() {
  const hash = window.location.hash || "#/";
  if (!hash.startsWith("#/")) {
    return "/";
  }

  const route = hash.slice(1);
  return route || "/";
}

function updateActiveMenu(route) {
  document.querySelectorAll(".menu-link[data-route]").forEach((link) => {
    const isActive = link.dataset.route === route;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function renderHomeRoute() {
  routeContent.innerHTML = `
    <p class="hero-label" id="hero-kicker"></p>
    <h1 class="hero-title" id="hero-title"></h1>
    <p class="hero-subtitle" id="hero-subtitle"></p>
    <div class="hero-controls" id="hero-controls"></div>
    <section class="weather-widget" aria-live="polite" aria-label="Current weather">
      <p class="weather-label">Current Weather</p>
      <div class="weather-content">
        <p class="weather-status" id="weather-status">Loading weather…</p>
        <p class="weather-location" id="weather-location"></p>
        <p class="weather-metrics" id="weather-metrics"></p>
      </div>
    </section>
    <section class="scribble-widget" aria-label="Scribble board">
      <div class="scribble-header">
        <p class="scribble-title">Quick Scribble Board</p>
        <button class="scribble-download" id="scribble-download" type="button">Download sketch</button>
      </div>
      <canvas id="scribble-canvas" class="scribble-canvas" width="480" height="220" aria-label="Scribble drawing area"></canvas>
    </section>
    <section class="hex-widget" aria-label="Hex converter">
      <p class="hex-title">Matrix Hex Translator</p>
      <label class="hex-label" for="hex-input">Type text</label>
      <textarea
        id="hex-input"
        class="hex-input"
        rows="4"
        placeholder="Type anything and watch the hex stream…"
      ></textarea>
      <p class="hex-label">Hex output</p>
      <output id="hex-output" class="hex-output" aria-live="polite">--</output>
    </section>
    <section class="sentence-widget" aria-label="Sentence structure analyzer">
      <p class="sentence-title">Sentence Structure Analyzer</p>
      <output id="sentence-output" class="sentence-output" aria-live="polite">
        Submit a sentence to see clause and part-of-speech analysis.
      </output>
      <form id="sentence-form" class="sentence-form">
        <label class="sentence-label" for="sentence-input">Sentence input</label>
        <textarea
          id="sentence-input"
          class="sentence-input"
          rows="4"
          placeholder="Example: The curious cat quietly watched the birds from the window."
          required
        ></textarea>
        <button type="submit" class="sentence-submit">Analyze sentence</button>
      </form>
    </section>
    <section class="logic-widget" aria-label="Logic gate simulator">
      <div class="logic-header">
        <p class="logic-title">Logic Gate Lab</p>
        <span class="logic-subtitle">Toggle inputs, pick a gate, and see the result instantly.</span>
      </div>
      <div class="logic-controls" role="group" aria-label="Logic inputs">
        <label class="logic-toggle" for="logic-input-a">
          <span>Input A</span>
          <input id="logic-input-a" type="checkbox" />
        </label>
        <label class="logic-toggle" for="logic-input-b">
          <span>Input B</span>
          <input id="logic-input-b" type="checkbox" />
        </label>
      </div>
      <div class="logic-gates" role="radiogroup" aria-label="Choose gate">
        <button type="button" class="logic-gate" data-gate="AND" aria-pressed="true">AND</button>
        <button type="button" class="logic-gate" data-gate="OR" aria-pressed="false">OR</button>
        <button type="button" class="logic-gate" data-gate="XOR" aria-pressed="false">XOR</button>
        <button type="button" class="logic-gate" data-gate="NAND" aria-pressed="false">NAND</button>
        <button type="button" class="logic-gate" data-gate="NOR" aria-pressed="false">NOR</button>
        <button type="button" class="logic-gate" data-gate="XNOR" aria-pressed="false">XNOR</button>
        <button type="button" class="logic-gate" data-gate="NOT_A" aria-pressed="false">NOT A</button>
        <button type="button" class="logic-gate" data-gate="NOT_B" aria-pressed="false">NOT B</button>
        <button type="button" class="logic-gate" data-gate="BUF_A" aria-pressed="false">BUFFER A</button>
        <button type="button" class="logic-gate" data-gate="BUF_B" aria-pressed="false">BUFFER B</button>
      </div>
      <div class="logic-result" aria-live="polite">
        <p class="logic-expression" id="logic-expression"></p>
        <p class="logic-output" id="logic-output"></p>
      </div>
      <div class="logic-circuit" aria-label="Circuit display">
        <svg viewBox="0 0 600 210" role="img" aria-label="Logic circuit visualization">
          <text x="18" y="52" class="logic-svg-label">A</text>
          <text x="18" y="152" class="logic-svg-label">B</text>
          <line id="wire-a" class="logic-wire" x1="40" y1="48" x2="205" y2="48" />
          <line id="wire-b" class="logic-wire" x1="40" y1="148" x2="205" y2="148" />
          <rect x="205" y="28" width="185" height="140" rx="18" class="logic-gate-body" />
          <text id="logic-circuit-gate" x="298" y="108" class="logic-svg-gate">AND</text>
          <line id="wire-out" class="logic-wire" x1="390" y1="98" x2="500" y2="98" />
          <circle id="logic-lamp" cx="536" cy="98" r="24" class="logic-lamp" />
          <text x="524" y="104" class="logic-svg-lamp-text">OUT</text>
        </svg>
      </div>
      <table class="truth-table" aria-label="Truth table">
        <thead>
          <tr>
            <th scope="col">A</th>
            <th scope="col">B</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody id="truth-table-body"></tbody>
      </table>
    </section>
    <div class="action-group">
      <a class="action" href="#/shows" aria-label="Open shows">View shows</a>
      <a class="action" href="#/camera" aria-label="Open camera page">Open camera page</a>
    </div>
  `;

  const heroKicker = document.getElementById("hero-kicker");
  const heroTitle = document.getElementById("hero-title");
  const heroSubtitle = document.getElementById("hero-subtitle");
  const heroControls = document.getElementById("hero-controls");
  const weatherStatus = document.getElementById("weather-status");
  const weatherLocation = document.getElementById("weather-location");
  const weatherMetrics = document.getElementById("weather-metrics");
  const scribbleCanvas = document.getElementById("scribble-canvas");
  const scribbleDownload = document.getElementById("scribble-download");
  const hexInput = document.getElementById("hex-input");
  const hexOutput = document.getElementById("hex-output");
  const sentenceForm = document.getElementById("sentence-form");
  const sentenceInput = document.getElementById("sentence-input");
  const sentenceOutput = document.getElementById("sentence-output");
  const logicInputA = document.getElementById("logic-input-a");
  const logicInputB = document.getElementById("logic-input-b");
  const logicGateButtons = [...document.querySelectorAll(".logic-gate")];
  const logicExpression = document.getElementById("logic-expression");
  const logicOutput = document.getElementById("logic-output");
  const truthTableBody = document.getElementById("truth-table-body");
  const logicCircuitGate = document.getElementById("logic-circuit-gate");
  const logicLamp = document.getElementById("logic-lamp");
  const wireA = document.getElementById("wire-a");
  const wireB = document.getElementById("wire-b");
  const wireOut = document.getElementById("wire-out");

  let currentSlide = 0;

  function renderSlide(index) {
    const slide = slides[index];
    heroKicker.textContent = slide.kicker;
    heroTitle.textContent = slide.title;
    heroSubtitle.innerHTML = slide.subtitle;

    [...heroControls.querySelectorAll(".dot")].forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });

    const meta = heroControls.querySelector(".meta");
    if (meta) {
      meta.textContent = `Slide ${index + 1} of ${slides.length}`;
    }
  }

  slides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.className = "dot";
    button.setAttribute("type", "button");
    button.setAttribute("aria-label", `Show slide ${index + 1}: ${slide.kicker}`);
    button.addEventListener("click", () => {
      currentSlide = index;
      renderSlide(currentSlide);
    });
    heroControls.appendChild(button);
  });

  const meta = document.createElement("span");
  meta.className = "meta";
  heroControls.appendChild(meta);

  renderSlide(currentSlide);

  const intervalId = window.setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    renderSlide(currentSlide);
  }, 4000);

  async function fetchWeather(latitude, longitude) {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m&timezone=auto`,
    );

    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    return response.json();
  }

  function renderWeather(data, locationLabel) {
    const current = data.current;
    weatherStatus.textContent = `${Math.round(current.temperature_2m)}°C and feels like ${Math.round(current.apparent_temperature)}°C`;
    weatherLocation.textContent = locationLabel;
    weatherMetrics.textContent = `Wind ${Math.round(current.wind_speed_10m)} km/h`;
  }

  async function loadWeather() {
    const fallback = { latitude: 40.7128, longitude: -74.006, label: "New York, fallback" };

    const loadFromCoordinates = async (latitude, longitude, label) => {
      const data = await fetchWeather(latitude, longitude);
      renderWeather(data, label);
    };

    if (!navigator.geolocation) {
      await loadFromCoordinates(fallback.latitude, fallback.longitude, fallback.label);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await loadFromCoordinates(latitude, longitude, "Your location");
        } catch {
          await loadFromCoordinates(fallback.latitude, fallback.longitude, fallback.label);
        }
      },
      async () => {
        await loadFromCoordinates(fallback.latitude, fallback.longitude, fallback.label);
      },
      { timeout: 3000 },
    );
  }

  loadWeather().catch(() => {
    weatherStatus.textContent = "Weather unavailable right now.";
    weatherLocation.textContent = "";
    weatherMetrics.textContent = "";
  });

  const drawingContext = scribbleCanvas.getContext("2d");
  drawingContext.fillStyle = "#ffffff";
  drawingContext.fillRect(0, 0, scribbleCanvas.width, scribbleCanvas.height);
  drawingContext.strokeStyle = "#4338ca";
  drawingContext.lineWidth = 3;
  drawingContext.lineCap = "round";
  drawingContext.lineJoin = "round";

  let isDrawing = false;

  function getCanvasPoint(event) {
    const bounds = scribbleCanvas.getBoundingClientRect();
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  }

  function startDrawing(event) {
    isDrawing = true;
    const point = getCanvasPoint(event);
    drawingContext.beginPath();
    drawingContext.moveTo(point.x, point.y);
  }

  function draw(event) {
    if (!isDrawing) {
      return;
    }

    const point = getCanvasPoint(event);
    drawingContext.lineTo(point.x, point.y);
    drawingContext.stroke();
  }

  function stopDrawing() {
    if (!isDrawing) {
      return;
    }

    isDrawing = false;
    drawingContext.closePath();
  }

  scribbleCanvas.addEventListener("pointerdown", startDrawing);
  scribbleCanvas.addEventListener("pointermove", draw);
  scribbleCanvas.addEventListener("pointerup", stopDrawing);
  scribbleCanvas.addEventListener("pointerleave", stopDrawing);

  scribbleDownload.addEventListener("click", () => {
    const anchor = document.createElement("a");
    anchor.href = scribbleCanvas.toDataURL("image/png");
    anchor.download = "phonefoof-scribble.png";
    anchor.click();
  });

  function toHexWordGroups(text) {
    return Array.from(text.matchAll(/\S+/g), (match) => {
      const [word] = match;
      const bytes = new TextEncoder().encode(word);
      const group = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(" ");

      return {
        group,
        start: match.index,
        end: (match.index ?? 0) + word.length,
      };
    });
  }

  function findActiveHexGroupIndex(groups, cursorPosition) {
    return groups.findIndex(({ start, end }) => cursorPosition >= start && cursorPosition <= end);
  }

  function syncHexOutput() {
    const groups = toHexWordGroups(hexInput.value);
    const cursorPosition = hexInput.selectionStart ?? 0;
    const activeGroupIndex = findActiveHexGroupIndex(groups, cursorPosition);
    hexOutput.replaceChildren();

    if (!groups.length) {
      hexOutput.textContent = "--";
      return;
    }

    groups.forEach(({ group }, index) => {
      const groupSpan = document.createElement("span");
      groupSpan.className = `hex-group ${index % 2 === 0 ? "is-primary" : "is-secondary"}`;
      groupSpan.classList.toggle("is-active", index === activeGroupIndex);
      groupSpan.textContent = group;
      hexOutput.appendChild(groupSpan);

      if (index < groups.length - 1) {
        const separator = document.createElement("span");
        separator.className = "hex-group-separator";
        separator.textContent = " | ";
        hexOutput.appendChild(separator);
      }
    });
  }

  hexInput.addEventListener("input", syncHexOutput);
  hexInput.addEventListener("click", syncHexOutput);
  hexInput.addEventListener("keyup", syncHexOutput);
  hexInput.addEventListener("select", syncHexOutput);
  syncHexOutput();

  function handleSentenceSubmit(event) {
    event.preventDefault();
    const text = sentenceInput.value.trim();

    if (!text) {
      sentenceOutput.innerHTML = "<p>Please enter a sentence first.</p>";
      return;
    }

    sentenceOutput.innerHTML = renderSentenceStructureAnalysis(text);
  }

  sentenceForm.addEventListener("submit", handleSentenceSubmit);

  const gateEvaluators = {
    AND: (a, b) => a && b,
    OR: (a, b) => a || b,
    XOR: (a, b) => a !== b,
    NAND: (a, b) => !(a && b),
    NOR: (a, b) => !(a || b),
    XNOR: (a, b) => a === b,
    NOT_A: (a) => !a,
    NOT_B: (_, b) => !b,
    BUF_A: (a) => a,
    BUF_B: (_, b) => b,
  };

  let activeGate = "AND";

  function toBit(value) {
    return value ? 1 : 0;
  }

  function renderTruthTable() {
    const combinations = [
      { a: false, b: false },
      { a: false, b: true },
      { a: true, b: false },
      { a: true, b: true },
    ];

    const currentA = logicInputA.checked;
    const currentB = logicInputB.checked;
    truthTableBody.replaceChildren();

    combinations.forEach(({ a, b }) => {
      const row = document.createElement("tr");
      row.classList.toggle("is-active", a === currentA && b === currentB);

      const result = gateEvaluators[activeGate](a, b);

      [toBit(a), toBit(b), toBit(result)].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = String(value);
        row.appendChild(cell);
      });

      truthTableBody.appendChild(row);
    });
  }

  function gateExpression(gate, a, b) {
    const formatter = {
      NOT_A: `NOT(${toBit(a)})`,
      NOT_B: `NOT(${toBit(b)})`,
      BUF_A: `BUF(${toBit(a)})`,
      BUF_B: `BUF(${toBit(b)})`,
    };

    return formatter[gate] || `${gate}(${toBit(a)}, ${toBit(b)})`;
  }

  function renderCircuit(a, b, result) {
    logicCircuitGate.textContent = activeGate.replace("_", " ");
    wireA.dataset.active = String(a);
    wireB.dataset.active = String(b);
    wireOut.dataset.active = String(result);
    logicLamp.dataset.active = String(result);
  }

  function syncLogicResult() {
    const a = logicInputA.checked;
    const b = logicInputB.checked;
    const result = gateEvaluators[activeGate](a, b);

    logicExpression.textContent = gateExpression(activeGate, a, b);
    logicOutput.textContent = `Result: ${toBit(result)}`;

    logicGateButtons.forEach((button) => {
      const isActive = button.dataset.gate === activeGate;
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.classList.toggle("is-active", isActive);
    });

    renderCircuit(a, b, result);
    renderTruthTable();
  }

  function handleGateSelection(event) {
    const gate = event.currentTarget.dataset.gate;
    if (!gate || !gateEvaluators[gate]) {
      return;
    }

    activeGate = gate;
    syncLogicResult();
  }

  logicInputA.addEventListener("change", syncLogicResult);
  logicInputB.addEventListener("change", syncLogicResult);
  logicGateButtons.forEach((button) => button.addEventListener("click", handleGateSelection));
  syncLogicResult();

  return () => {
    window.clearInterval(intervalId);
    scribbleCanvas.removeEventListener("pointerdown", startDrawing);
    scribbleCanvas.removeEventListener("pointermove", draw);
    scribbleCanvas.removeEventListener("pointerup", stopDrawing);
    scribbleCanvas.removeEventListener("pointerleave", stopDrawing);
    hexInput.removeEventListener("input", syncHexOutput);
    hexInput.removeEventListener("click", syncHexOutput);
    hexInput.removeEventListener("keyup", syncHexOutput);
    hexInput.removeEventListener("select", syncHexOutput);
    sentenceForm.removeEventListener("submit", handleSentenceSubmit);
    logicInputA.removeEventListener("change", syncLogicResult);
    logicInputB.removeEventListener("change", syncLogicResult);
    logicGateButtons.forEach((button) => button.removeEventListener("click", handleGateSelection));
  };
}

function renderShowsRoute() {
  const store = createShowsStore();
  const shows = store.seedIfEmpty();

  routeContent.innerHTML = `
    <p class="hero-label">Shows</p>
    <h1 class="hero-title">Your shows list</h1>
    <p class="hero-subtitle">A quick overview of your saved shows. Go to Shows CRUD to manage the full library.</p>
    <ul class="show-list" aria-label="Featured shows list">
      ${shows
        .map(
          (show) => `
            <li class="show-item">
              <span class="show-item-thumb" aria-hidden="true">
                ${show.thumbnail || show.link ? `<img src="${escapeHtml(show.thumbnail || show.link)}" alt="" loading="lazy" />` : "<span>📺</span>"}
              </span>
              <span class="show-item-content">
                <strong>${escapeHtml(show.title)}</strong>
                <span>${escapeHtml(show.genre)} · ${show.seasons} season${show.seasons === 1 ? "" : "s"} · Episode ${show.episode ?? 1}</span>
              </span>
            </li>
          `,
        )
        .join("")}
    </ul>
    <a class="action" href="#/" aria-label="Go to home">Back home</a>
  `;
}

function renderShowsCrudRoute() {
  routeContent.innerHTML = '<div id="shows-crud-route"></div>';
  const showsCrudContainer = document.getElementById("shows-crud-route");
  renderShowsSection(showsCrudContainer);
}

function renderBotanyRoute() {
  routeContent.innerHTML = `
    <p class="hero-label">Botany</p>
    <h1 class="hero-title">Botany examples with explanations + math</h1>
    <p class="hero-subtitle">
      Botany uses quantitative models to explain how plants capture light, move water, allocate biomass,
      and estimate productivity. Below are worked examples used in plant physiology and ecology.
    </p>

    <details class="botany-vars" aria-label="Botany variable explainers" open>
      <summary>Variable explainers</summary>
      <ul class="botany-vars-list">
        <li><strong>A</strong>: photosynthetic assimilation rate</li>
        <li><strong>I</strong>: incoming light intensity</li>
        <li><strong>A<sub>max</sub></strong>: maximum assimilation at saturation</li>
        <li><strong>k</strong>: light-response curvature constant</li>
        <li><strong>W<sub>1</sub></strong>, <strong>W<sub>2</sub></strong>: biomass at <strong>t<sub>1</sub></strong> and <strong>t<sub>2</sub></strong></li>
        <li><strong>RGR</strong>: relative growth rate</li>
        <li><strong>E</strong>: transpiration rate</li>
        <li><strong>WUE</strong>: water-use efficiency</li>
        <li><strong>g<sub>s</sub></strong>: stomatal conductance</li>
        <li><strong>VPD</strong>: vapor pressure deficit</li>
        <li><strong>LAI</strong>: leaf area index</li>
        <li><strong>T<sub>mean</sub></strong>: daily mean temperature</li>
        <li><strong>T<sub>base</sub></strong>: base temperature threshold</li>
        <li><strong>GDD</strong>: growing degree days</li>
      </ul>
    </details>

    <section class="botany-grid" aria-label="Botany examples">
      <article class="botany-card">
        <h2>1) Photosynthesis response to light</h2>
        <p>
          A saturating curve can describe photosynthesis at different light intensities:
          <strong>A(I) = A<sub>max</sub>(1 - e<sup>-kI</sup>)</strong>.
        </p>
        <form class="botany-inputs" id="botany-example-1">
          <label>A<sub>max</sub>
            <input id="photo-amax" data-sync-key="photo-amax" type="number" min="0" max="60" value="25" step="0.1" />
            <input data-sync-key="photo-amax" type="range" min="0" max="60" value="25" step="0.1" />
          </label>
          <label>k
            <input id="photo-k" data-sync-key="photo-k" type="number" min="0" max="0.02" value="0.003" step="0.0001" />
            <input data-sync-key="photo-k" type="range" min="0" max="0.02" value="0.003" step="0.0001" />
          </label>
          <label>I target
            <input id="photo-i" data-sync-key="photo-i" type="number" min="0" max="1200" value="500" step="10" />
            <input data-sync-key="photo-i" type="range" min="0" max="1200" value="500" step="10" />
          </label>
        </form>
        <p class="botany-math" id="botany-result-1"></p>
        <p class="botany-math">
          <span class="botany-latex">\\(A(I) = A_{max}(1 - e^{-kI})\\)</span>
        </p>
        <div class="camera-visual-wrap">
          <p class="camera-visual-label">Live plant visual</p>
          <canvas id="botany-visual-1" class="botany-visual" aria-label="Photosynthesis vitality visual" role="img"></canvas>
        </div>
        <div class="botany-plot-wrap">
          <canvas id="botany-plot-1" class="botany-plot" aria-label="Photosynthesis response chart" role="img"></canvas>
        </div>
      </article>

      <article class="botany-card">
        <h2>2) Relative growth rate (RGR)</h2>
        <p>
          RGR tracks biomass increase relative to current mass:
          <strong>RGR = (ln W<sub>2</sub> - ln W<sub>1</sub>) / (t<sub>2</sub> - t<sub>1</sub>)</strong>.
        </p>
        <form class="botany-inputs" id="botany-example-2">
          <label>W<sub>1</sub> (g)
            <input id="rgr-w1" data-sync-key="rgr-w1" type="number" min="0.1" max="20" value="2" step="0.1" />
            <input data-sync-key="rgr-w1" type="range" min="0.1" max="20" value="2" step="0.1" />
          </label>
          <label>W<sub>2</sub> (g)
            <input id="rgr-w2" data-sync-key="rgr-w2" type="number" min="0.1" max="30" value="3.5" step="0.1" />
            <input data-sync-key="rgr-w2" type="range" min="0.1" max="30" value="3.5" step="0.1" />
          </label>
          <label>t<sub>1</sub> (days)
            <input id="rgr-t1" data-sync-key="rgr-t1" type="number" min="0" max="30" value="0" step="1" />
            <input data-sync-key="rgr-t1" type="range" min="0" max="30" value="0" step="1" />
          </label>
          <label>t<sub>2</sub> (days)
            <input id="rgr-t2" data-sync-key="rgr-t2" type="number" min="1" max="60" value="10" step="1" />
            <input data-sync-key="rgr-t2" type="range" min="1" max="60" value="10" step="1" />
          </label>
        </form>
        <p class="botany-math" id="botany-result-2"></p>
        <p class="botany-math">
          <span class="botany-latex">\\(RGR = \\frac{\\ln W_2 - \\ln W_1}{t_2 - t_1}\\)</span>
        </p>
        <div class="camera-visual-wrap">
          <p class="camera-visual-label">Live plant visual</p>
          <canvas id="botany-visual-2" class="botany-visual" aria-label="Growth-stage visual" role="img"></canvas>
        </div>
        <div class="botany-plot-wrap">
          <canvas id="botany-plot-2" class="botany-plot" aria-label="Relative growth rate chart" role="img"></canvas>
        </div>
      </article>

      <article class="botany-card">
        <h2>3) Water-use efficiency (WUE)</h2>
        <p>
          WUE compares carbon gain to water loss:
          <strong>WUE = A / E</strong>, where A is assimilation and E is transpiration.
        </p>
        <form class="botany-inputs" id="botany-example-3">
          <label>A
            <input id="wue-a" data-sync-key="wue-a" type="number" min="0" max="40" value="12" step="0.1" />
            <input data-sync-key="wue-a" type="range" min="0" max="40" value="12" step="0.1" />
          </label>
          <label>E
            <input id="wue-e" data-sync-key="wue-e" type="number" min="0.1" max="12" value="4" step="0.1" />
            <input data-sync-key="wue-e" type="range" min="0.1" max="12" value="4" step="0.1" />
          </label>
        </form>
        <p class="botany-math" id="botany-result-3"></p>
        <p class="botany-math">
          <span class="botany-latex">\\(WUE = \\frac{A}{E}\\)</span>
        </p>
        <div class="camera-visual-wrap">
          <p class="camera-visual-label">Live plant visual</p>
          <canvas id="botany-visual-3" class="botany-visual" aria-label="Water-use response visual" role="img"></canvas>
        </div>
        <div class="botany-plot-wrap">
          <canvas id="botany-plot-3" class="botany-plot" aria-label="Water-use efficiency chart" role="img"></canvas>
        </div>
      </article>

      <article class="botany-card">
        <h2>4) Leaf area index (LAI)</h2>
        <p>
          LAI quantifies canopy leaf area per ground area:
          <strong>LAI = (total one-sided leaf area) / (ground area)</strong>.
        </p>
        <form class="botany-inputs" id="botany-example-4">
          <label>Leaf area (m²)
            <input id="lai-leaf-area" data-sync-key="lai-leaf-area" type="number" min="0" max="80" value="18" step="0.1" />
            <input data-sync-key="lai-leaf-area" type="range" min="0" max="80" value="18" step="0.1" />
          </label>
          <label>Ground area (m²)
            <input id="lai-ground-area" data-sync-key="lai-ground-area" type="number" min="0.5" max="25" value="6" step="0.1" />
            <input data-sync-key="lai-ground-area" type="range" min="0.5" max="25" value="6" step="0.1" />
          </label>
        </form>
        <p class="botany-math" id="botany-result-4"></p>
        <p class="botany-math">
          <span class="botany-latex">\\(LAI = \\frac{\\text{total one-sided leaf area}}{\\text{ground area}}\\)</span>
        </p>
        <div class="camera-visual-wrap">
          <p class="camera-visual-label">Live plant visual</p>
          <canvas id="botany-visual-4" class="botany-visual" aria-label="Canopy density visual" role="img"></canvas>
        </div>
        <div class="botany-plot-wrap">
          <canvas id="botany-plot-4" class="botany-plot" aria-label="Leaf area index chart" role="img"></canvas>
        </div>
      </article>

      <article class="botany-card">
        <h2>5) Transpiration flux from conductance gradient</h2>
        <p>
          A simplified flux model estimates transpiration as:
          <strong>E = g<sub>s</sub> × VPD</strong>, where g<sub>s</sub> is stomatal conductance and VPD is vapor pressure deficit.
        </p>
        <form class="botany-inputs" id="botany-example-5">
          <label>g<sub>s</sub>
            <input id="transpiration-gs" data-sync-key="transpiration-gs" type="number" min="0" max="1.2" value="0.35" step="0.01" />
            <input data-sync-key="transpiration-gs" type="range" min="0" max="1.2" value="0.35" step="0.01" />
          </label>
          <label>VPD
            <input id="transpiration-vpd" data-sync-key="transpiration-vpd" type="number" min="0" max="4" value="1.8" step="0.1" />
            <input data-sync-key="transpiration-vpd" type="range" min="0" max="4" value="1.8" step="0.1" />
          </label>
        </form>
        <p class="botany-math" id="botany-result-5"></p>
        <p class="botany-math">
          LaTeX: <span class="botany-latex">\\(E = g_s \\times VPD\\)</span><br />
          Read as: E equals g sub s times V P D.
        </p>
        <div class="camera-visual-wrap">
          <p class="camera-visual-label">Live plant visual</p>
          <canvas id="botany-visual-5" class="botany-visual" aria-label="Transpiration stress visual" role="img"></canvas>
        </div>
        <div class="botany-plot-wrap">
          <canvas id="botany-plot-5" class="botany-plot" aria-label="Transpiration flux chart" role="img"></canvas>
        </div>
      </article>

      <article class="botany-card">
        <h2>6) Thermal time (growing degree days)</h2>
        <p>
          Development can be modeled by thermal accumulation:
          <strong>GDD = Σ max(0, T<sub>mean</sub> - T<sub>base</sub>)</strong>.
        </p>
        <form class="botany-inputs" id="botany-example-6">
          <label>T<sub>base</sub>
            <input id="gdd-base" data-sync-key="gdd-base" type="number" min="0" max="25" value="10" step="0.5" />
            <input data-sync-key="gdd-base" type="range" min="0" max="25" value="10" step="0.5" />
          </label>
          <label>Day 1
            <input id="gdd-day-1" data-sync-key="gdd-day-1" type="number" min="-5" max="40" value="12" step="0.5" />
            <input data-sync-key="gdd-day-1" type="range" min="-5" max="40" value="12" step="0.5" />
          </label>
          <label>Day 2
            <input id="gdd-day-2" data-sync-key="gdd-day-2" type="number" min="-5" max="40" value="14" step="0.5" />
            <input data-sync-key="gdd-day-2" type="range" min="-5" max="40" value="14" step="0.5" />
          </label>
          <label>Day 3
            <input id="gdd-day-3" data-sync-key="gdd-day-3" type="number" min="-5" max="40" value="9" step="0.5" />
            <input data-sync-key="gdd-day-3" type="range" min="-5" max="40" value="9" step="0.5" />
          </label>
          <label>Day 4
            <input id="gdd-day-4" data-sync-key="gdd-day-4" type="number" min="-5" max="40" value="16" step="0.5" />
            <input data-sync-key="gdd-day-4" type="range" min="-5" max="40" value="16" step="0.5" />
          </label>
          <label>Day 5
            <input id="gdd-day-5" data-sync-key="gdd-day-5" type="number" min="-5" max="40" value="18" step="0.5" />
            <input data-sync-key="gdd-day-5" type="range" min="-5" max="40" value="18" step="0.5" />
          </label>
        </form>
        <p class="botany-math" id="botany-result-6"></p>
        <p class="botany-math">
          <span class="botany-latex">\\(GDD = \\sum \\max(0, T_{mean} - T_{base})\\)</span>
        </p>
        <div class="camera-visual-wrap">
          <p class="camera-visual-label">Live plant visual</p>
          <canvas id="botany-visual-6" class="botany-visual" aria-label="Thermal development visual" role="img"></canvas>
        </div>
        <div class="botany-plot-wrap">
          <canvas id="botany-plot-6" class="botany-plot" aria-label="Growing degree days chart" role="img"></canvas>
        </div>
      </article>

      <article class="botany-card">
        <h2>7) Live tree structure visual (plant-based)</h2>
        <p>
          This live sketch turns simple tree parameters into a plant-shaped canopy + trunk visualization,
          with a rough canopy volume estimate for quick field intuition.
        </p>
        <form class="botany-inputs" id="botany-example-7">
          <label>Tree height (m)
            <input id="tree-height" data-sync-key="tree-height" type="number" min="1" max="40" value="9" step="0.5" />
            <input data-sync-key="tree-height" type="range" min="1" max="40" value="9" step="0.5" />
          </label>
          <label>Canopy radius (m)
            <input id="tree-canopy-radius" data-sync-key="tree-canopy-radius" type="number" min="0.5" max="12" value="3.2" step="0.1" />
            <input data-sync-key="tree-canopy-radius" type="range" min="0.5" max="12" value="3.2" step="0.1" />
          </label>
          <label>Branch density
            <input id="tree-branch-density" data-sync-key="tree-branch-density" type="number" min="1" max="9" value="5" step="1" />
            <input data-sync-key="tree-branch-density" type="range" min="1" max="9" value="5" step="1" />
          </label>
          <label>Leaf coverage
            <input id="tree-leaf-coverage" data-sync-key="tree-leaf-coverage" type="number" min="0.2" max="1" value="0.7" step="0.05" />
            <input data-sync-key="tree-leaf-coverage" type="range" min="0.2" max="1" value="0.7" step="0.05" />
          </label>
        </form>
        <p class="botany-math" id="botany-result-7"></p>
        <div class="camera-visual-wrap">
          <p class="camera-visual-label">Live tree canopy visual</p>
          <canvas id="botany-visual-7" class="botany-visual" aria-label="Live tree structure visual" role="img"></canvas>
        </div>
      </article>
    </section>

    <div class="hero-controls">
      <a class="action" href="#/" aria-label="Go to home">Back home</a>
      <a class="action" href="#/shows" aria-label="Go to shows">Go to shows</a>
    </div>
  `;

  renderBotanyLatex(routeContent);
  const cleanupPlots = renderBotanyInteractive();

  return () => {
    cleanupPlots();
  };
}

function renderCameraRoute() {
  routeContent.innerHTML = `
    <p class="hero-label">Camera Optics</p>
    <h1 class="hero-title">Camera + lens examples with explanations + math</h1>
    <p class="hero-subtitle">
      Like botany models, camera systems are easier to understand with equations. These worked examples cover field of
      view, aperture, exposure, depth of field, and crop factor equivalence.
    </p>

    <details class="botany-vars" aria-label="Camera variable explainers" open>
      <summary>Variable explainers</summary>
      <ul class="botany-vars-list">
        <li><strong>f</strong>: focal length (mm)</li>
        <li><strong>w</strong>: sensor width (mm)</li>
        <li><strong>FOV</strong>: field of view (degrees)</li>
        <li><strong>N</strong>: f-number (aperture)</li>
        <li><strong>t</strong>: shutter time (seconds)</li>
        <li><strong>ISO</strong>: sensor gain sensitivity scale</li>
        <li><strong>EV</strong>: exposure value</li>
        <li><strong>CoC</strong>: circle of confusion (mm)</li>
        <li><strong>H</strong>: hyperfocal distance</li>
        <li><strong>CF</strong>: crop factor</li>
      </ul>
    </details>

    <section class="botany-grid" aria-label="Camera examples">
      <article class="botany-card">
        <h2>1) Field of view from sensor + focal length</h2>
        <p>
          Horizontal field of view can be approximated by:
          <strong>FOV = 2 \u00d7 arctan(w / (2f))</strong>.
        </p>
        <form class="botany-inputs" id="camera-example-1">
          <label>Sensor width (mm)
            <input id="fov-sensor-width" data-sync-key="fov-sensor-width" type="number" min="8" max="50" value="36" step="0.1" />
            <input data-sync-key="fov-sensor-width" type="range" min="8" max="50" value="36" step="0.1" />
          </label>
          <label>Focal length (mm)
            <input id="fov-focal-length" data-sync-key="fov-focal-length" type="number" min="8" max="200" value="35" step="1" />
            <input data-sync-key="fov-focal-length" type="range" min="8" max="200" value="35" step="1" />
          </label>
        </form>
        <p class="botany-math" id="camera-result-1"></p>
        <p class="botany-math">
          <span class="botany-latex">\\(FOV = 2\\arctan(\\frac{w}{2f})\\)</span>
        </p>
        <div class="camera-visual-wrap">
          <p class="camera-visual-label">Learner visual</p>
          <canvas id="camera-visual-1" class="camera-visual" aria-label="Field of view visual" role="img"></canvas>
        </div>
        <div class="botany-plot-wrap">
          <canvas id="camera-plot-1" class="botany-plot" aria-label="Field of view chart" role="img"></canvas>
        </div>
      </article>

      <article class="botany-card">
        <h2>2) Aperture, light, and exposure value</h2>
        <p>
          Aperture controls light as <strong>relative light \u221d 1/N<sup>2</sup></strong>. Exposure value at ISO 100 is
          <strong>EV<sub>100</sub> = log<sub>2</sub>(N<sup>2</sup>/t)</strong>.
        </p>
        <form class="botany-inputs" id="camera-example-2">
          <label>f-number (N)
            <input id="aperture-f-number" data-sync-key="aperture-f-number" type="number" min="1.2" max="16" value="2.8" step="0.1" />
            <input data-sync-key="aperture-f-number" type="range" min="1.2" max="16" value="2.8" step="0.1" />
          </label>
          <label>Shutter time (s)
            <input id="aperture-shutter" data-sync-key="aperture-shutter" type="number" min="0.001" max="1" value="0.0167" step="0.0005" />
            <input data-sync-key="aperture-shutter" type="range" min="0.001" max="1" value="0.0167" step="0.0005" />
          </label>
          <label>ISO
            <input id="aperture-iso" data-sync-key="aperture-iso" type="number" min="100" max="12800" value="400" step="100" />
            <input data-sync-key="aperture-iso" type="range" min="100" max="12800" value="400" step="100" />
          </label>
        </form>
        <p class="botany-math" id="camera-result-2"></p>
        <p class="botany-math">
          <span class="botany-latex">\\(EV = \\log_2(\\frac{N^2}{t}) - \\log_2(\\frac{ISO}{100})\\)</span>
        </p>
        <div class="camera-visual-wrap">
          <p class="camera-visual-label">Learner visual</p>
          <canvas id="camera-visual-2" class="camera-visual" aria-label="Exposure visual" role="img"></canvas>
        </div>
        <div class="botany-plot-wrap">
          <canvas id="camera-plot-2" class="botany-plot" aria-label="Aperture light chart" role="img"></canvas>
        </div>
      </article>

      <article class="botany-card">
        <h2>3) Depth of field and hyperfocal intuition</h2>
        <p>
          A simple DOF model uses hyperfocal distance:
          <strong>H = f<sup>2</sup> / (N \u00d7 CoC) + f</strong>.
        </p>
        <form class="botany-inputs" id="camera-example-3">
          <label>Focal length (mm)
            <input id="dof-focal" data-sync-key="dof-focal" type="number" min="14" max="200" value="50" step="1" />
            <input data-sync-key="dof-focal" type="range" min="14" max="200" value="50" step="1" />
          </label>
          <label>f-number
            <input id="dof-f-number" data-sync-key="dof-f-number" type="number" min="1.4" max="16" value="2.8" step="0.1" />
            <input data-sync-key="dof-f-number" type="range" min="1.4" max="16" value="2.8" step="0.1" />
          </label>
          <label>Subject distance (m)
            <input id="dof-distance" data-sync-key="dof-distance" type="number" min="0.5" max="30" value="3" step="0.1" />
            <input data-sync-key="dof-distance" type="range" min="0.5" max="30" value="3" step="0.1" />
          </label>
          <label>CoC (mm)
            <input id="dof-coc" data-sync-key="dof-coc" type="number" min="0.01" max="0.04" value="0.03" step="0.001" />
            <input data-sync-key="dof-coc" type="range" min="0.01" max="0.04" value="0.03" step="0.001" />
          </label>
        </form>
        <p class="botany-math" id="camera-result-3"></p>
        <p class="botany-math">
          <span class="botany-latex">\\(H = \\frac{f^2}{N \\cdot CoC} + f\\)</span>
        </p>
        <div class="camera-visual-wrap">
          <p class="camera-visual-label">Learner visual</p>
          <canvas id="camera-visual-3" class="camera-visual" aria-label="Depth of field visual" role="img"></canvas>
        </div>
        <div class="botany-plot-wrap">
          <canvas id="camera-plot-3" class="botany-plot" aria-label="Depth of field chart" role="img"></canvas>
        </div>
      </article>

      <article class="botany-card">
        <h2>4) Crop factor and equivalent focal length</h2>
        <p>
          Equivalent framing is estimated by:
          <strong>f<sub>eq</sub> = f \u00d7 CF</strong>.
        </p>
        <form class="botany-inputs" id="camera-example-4">
          <label>Lens focal length (mm)
            <input id="crop-focal" data-sync-key="crop-focal" type="number" min="8" max="200" value="35" step="1" />
            <input data-sync-key="crop-focal" type="range" min="8" max="200" value="35" step="1" />
          </label>
          <label>Crop factor
            <input id="crop-factor" data-sync-key="crop-factor" type="number" min="0.7" max="2.7" value="1.5" step="0.1" />
            <input data-sync-key="crop-factor" type="range" min="0.7" max="2.7" value="1.5" step="0.1" />
          </label>
        </form>
        <p class="botany-math" id="camera-result-4"></p>
        <p class="botany-math">
          <span class="botany-latex">\\(f_{eq} = f \\times CF\\)</span>
        </p>
        <div class="camera-visual-wrap">
          <p class="camera-visual-label">Learner visual</p>
          <canvas id="camera-visual-4" class="camera-visual" aria-label="Crop factor visual" role="img"></canvas>
        </div>
        <div class="botany-plot-wrap">
          <canvas id="camera-plot-4" class="botany-plot" aria-label="Equivalent focal length chart" role="img"></canvas>
        </div>
      </article>
    </section>

    <div class="hero-controls">
      <a class="action" href="#/" aria-label="Go to home">Back home</a>
      <a class="action" href="#/botany" aria-label="Go to botany">Go to botany</a>
    </div>
  `;

  renderBotanyLatex(routeContent);
  const cleanupPlots = renderCameraInteractive();

  return () => {
    cleanupPlots();
  };
}

function renderPianoRoute() {
  routeContent.innerHTML = `
    <p class="hero-label">Piano Guide</p>
    <h1 class="hero-title">How to Play Piano</h1>
    <p class="hero-subtitle">
      Learn the fundamentals with a visual keyboard, hand-position tips, and beginner-friendly note patterns you can
      practice right away.
    </p>

    <section class="piano-layout" aria-label="How to play piano examples">
      <article class="piano-card">
        <h2>1) Know the keyboard pattern</h2>
        <p>
          Piano keys repeat in groups of 12 notes. White keys are natural notes (C, D, E, F, G, A, B) and black keys
          are sharps/flats. Find any group of <strong>two black keys</strong>; the white key immediately to the left is
          <strong>C</strong>.
        </p>
        <div class="piano-keys" role="img" aria-label="Piano key pattern showing C major notes and black keys">
          <span class="white-key is-highlight">C</span>
          <span class="white-key">D</span>
          <span class="white-key">E</span>
          <span class="white-key">F</span>
          <span class="white-key">G</span>
          <span class="white-key">A</span>
          <span class="white-key">B</span>
          <span class="black-key black-1">C#</span>
          <span class="black-key black-2">D#</span>
          <span class="black-key black-4">F#</span>
          <span class="black-key black-5">G#</span>
          <span class="black-key black-6">A#</span>
        </div>
      </article>

      <article class="piano-card">
        <h2>2) Start with finger numbers</h2>
        <p>
          Use finger numbers instead of note names while learning: <strong>1 = thumb</strong> through
          <strong>5 = pinky</strong>. Place your right-hand thumb on middle C and curve your fingers naturally.
        </p>
        <ol>
          <li>Right hand C position: 1(C), 2(D), 3(E), 4(F), 5(G).</li>
          <li>Play slowly with a steady pulse: one note per beat.</li>
          <li>Keep your wrist relaxed and avoid flattening fingers.</li>
        </ol>
      </article>

      <article class="piano-card">
        <h2>3) Practice a C major scale</h2>
        <p>
          Scale notes: <strong>C - D - E - F - G - A - B - C</strong>. On the way up, tuck your thumb under after
          finger 3.
        </p>
        <p class="piano-pattern">
          Right hand fingering: <strong>1 2 3 1 2 3 4 5</strong><br />
          Left hand fingering: <strong>5 4 3 2 1 3 2 1</strong>
        </p>
      </article>

      <article class="piano-card">
        <h2>4) Build your first chords</h2>
        <p>
          A major triad uses <strong>root + third + fifth</strong>. Start with these three common chords:
        </p>
        <ul class="piano-chords">
          <li><strong>C major:</strong> C - E - G</li>
          <li><strong>F major:</strong> F - A - C</li>
          <li><strong>G major:</strong> G - B - D</li>
        </ul>
        <p>
          Try this progression slowly: <strong>C | F | G | C</strong>. Hold each chord for 4 counts.
        </p>
      </article>
    </section>

    <div class="hero-controls">
      <a class="action" href="#/" aria-label="Go to home">Back home</a>
      <a class="action" href="#/shows" aria-label="Go to shows">Go to shows</a>
    </div>
  `;
}

function renderRecursionTreeRoute() {
  routeContent.innerHTML = `
    <p class="hero-label">Canvas Playground</p>
    <h1 class="hero-title">Interactive Recursion Tree</h1>
    <p class="hero-subtitle">
      Use the sliders to shape a recursive branching tree. Every adjustment redraws the canvas immediately so you can
      experiment with depth, branching angle, and scaling.
    </p>

    <section class="botany-grid" aria-label="Recursion tree controls and preview">
      <article class="botany-card recursion-controls-card">
        <h2>Tree controls</h2>
        <p>Tune these values and watch the recursion tree update live.</p>
        <details class="recursion-slider-dropdown" id="recursion-slider-dropdown" open>
          <summary>Open slider controls</summary>
          <form class="botany-inputs recursion-inputs" id="recursion-tree-form">
            <label>Depth
              <input id="tree-depth" data-sync-key="tree-depth" type="number" min="1" max="13" value="9" step="1" />
              <input data-sync-key="tree-depth" type="range" min="1" max="13" value="9" step="1" />
            </label>
            <label>Branch angle (°)
              <input id="tree-angle" data-sync-key="tree-angle" type="number" min="5" max="80" value="25" step="1" />
              <input data-sync-key="tree-angle" type="range" min="5" max="80" value="25" step="1" />
            </label>
            <label>Length shrink factor
              <input id="tree-scale" data-sync-key="tree-scale" type="number" min="0.55" max="0.85" value="0.72" step="0.01" />
              <input data-sync-key="tree-scale" type="range" min="0.55" max="0.85" value="0.72" step="0.01" />
            </label>
            <label>Trunk length (px)
              <input id="tree-length" data-sync-key="tree-length" type="number" min="40" max="190" value="110" step="1" />
              <input data-sync-key="tree-length" type="range" min="40" max="190" value="110" step="1" />
            </label>
            <label>Line width (px)
              <input id="tree-width" data-sync-key="tree-width" type="number" min="1" max="22" value="10" step="1" />
              <input data-sync-key="tree-width" type="range" min="1" max="22" value="10" step="1" />
            </label>
          </form>
          <p class="botany-math" id="recursion-tree-stats" aria-live="polite"></p>
        </details>
      </article>

      <article class="botany-card">
        <h2>Canvas render</h2>
        <p>The tree starts from the bottom center and recursively branches left and right.</p>
        <div class="camera-visual-wrap recursion-canvas-wrap">
          <p class="camera-visual-label">2D canvas output</p>
          <canvas id="recursion-tree-canvas" class="camera-visual recursion-canvas" aria-label="Recursion tree drawn on canvas" role="img"></canvas>
        </div>
      </article>
    </section>

    <div class="hero-controls">
      <a class="action" href="#/" aria-label="Go to home">Back home</a>
      <a class="action" href="#/camera" aria-label="Go to camera">Go to camera</a>
    </div>
  `;

  function num(id) {
    const value = Number(document.getElementById(id)?.value);
    return Number.isFinite(value) ? value : 0;
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

  function drawTree() {
    const canvas = document.getElementById("recursion-tree-canvas");
    const stats = document.getElementById("recursion-tree-stats");
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const depth = Math.max(1, Math.round(num("tree-depth")));
    const angle = (Math.max(5, Math.min(80, num("tree-angle"))) * Math.PI) / 180;
    const scale = Math.max(0.55, Math.min(0.85, num("tree-scale")));
    const trunkLength = Math.max(40, num("tree-length"));
    const lineWidth = Math.max(1, num("tree-width"));

    const width = canvas.clientWidth || 360;
    const height = canvas.clientHeight || 260;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#eef2ff");
    bg.addColorStop(1, "#f8fafc");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const branchesEstimate = 2 ** depth - 1;

    function branch(x, y, len, currentAngle, level) {
      if (level > depth || len < 1) {
        return;
      }

      const progress = level / depth;
      const x2 = x + Math.cos(currentAngle) * len;
      const y2 = y + Math.sin(currentAngle) * len;

      ctx.strokeStyle = `hsl(${Math.round(22 + progress * 105)} 58% ${Math.round(28 + progress * 18)}%)`;
      ctx.lineWidth = Math.max(0.7, lineWidth * (1 - progress * 0.75));
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      branch(x2, y2, len * scale, currentAngle - angle, level + 1);
      branch(x2, y2, len * scale, currentAngle + angle, level + 1);
    }

    branch(width / 2, height - 16, trunkLength, -Math.PI / 2, 1);

    if (stats) {
      stats.innerHTML = `Approx branches: <strong>${branchesEstimate.toLocaleString()}</strong> · Final segment length: <strong>${(trunkLength * scale ** (depth - 1)).toFixed(1)} px</strong>`;
    }
  }

  const sliderDropdown = document.getElementById("recursion-slider-dropdown");
  if (sliderDropdown && window.matchMedia("(max-width: 700px)").matches) {
    sliderDropdown.open = false;
  }

  const form = document.getElementById("recursion-tree-form");
  if (form) {
    syncPairedInputs(form);
    form.addEventListener("input", drawTree);
    form.addEventListener("submit", (event) => event.preventDefault());
  }

  window.addEventListener("resize", drawTree);
  drawTree();

  return () => {
    window.removeEventListener("resize", drawTree);
  };
}


function renderThreeRoute() {
  return renderThreeDemoRoute(routeContent);
}

function renderThreeSuperneatRoute() {
  return renderSuperneatDemoRoute(routeContent);
}

const routes = {
  "/": renderHomeRoute,
  "/shows": renderShowsRoute,
  "/shows-crud": renderShowsCrudRoute,
  "/botany": renderBotanyRoute,
  "/camera": renderCameraRoute,
  "/recursion-tree": renderRecursionTreeRoute,
  "/piano": renderPianoRoute,
  "/three-demo": renderThreeRoute,
  "/three-superneat": renderThreeSuperneatRoute,
};

function renderRoute() {
  const route = getCurrentRoute();
  const renderer = routes[route] || routes["/"];

  if (typeof activeRouteCleanup === "function") {
    activeRouteCleanup();
    activeRouteCleanup = null;
  }

  activeRouteCleanup = renderer() || null;
  updateActiveMenu(route in routes ? route : "/");
}

window.addEventListener("hashchange", renderRoute);

if (!window.location.hash) {
  window.location.hash = "#/";
} else {
  renderRoute();
}
