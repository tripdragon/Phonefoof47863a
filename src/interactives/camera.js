import Chart from "chart.js/auto";

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

export { renderCameraInteractive };
