import "./style.css";
import "katex/dist/katex.min.css";
import renderMathInElement from "katex/contrib/auto-render";
import Chart from "chart.js/auto";
import { renderShowsSection } from "./shows/controller";
import { createShowsStore } from "./shows/store";
import { renderThreeDemoRoute } from "./three-demo/scene";
import { renderSuperneatDemoRoute } from "./three-demo/superneat-scene";

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
          <li><a class="menu-link" data-route="/three-demo" href="#/three-demo">Three.js Demo</a></li>
          <li><a class="menu-link" data-route="/three-superneat" href="#/three-superneat">Three.js SuperNeat</a></li>
        </ul>
      </nav>
      <div id="route-content"></div>
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
    setResult("botany-result-6", `Total GDD = <strong>${cumulative.toFixed(2)} degree-days</strong>`);
  }

  const actions = [
    ["botany-example-1", updatePhotosynthesis],
    ["botany-example-2", updateRgr],
    ["botany-example-3", updateWue],
    ["botany-example-4", updateLai],
    ["botany-example-5", updateTranspiration],
    ["botany-example-6", updateGdd],
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
    <a class="action" href="#/shows" aria-label="Open shows">View shows</a>
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
        <div class="botany-plot-wrap">
          <canvas id="botany-plot-6" class="botany-plot" aria-label="Growing degree days chart" role="img"></canvas>
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
