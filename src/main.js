import "./style.css";
import { renderShowsSection } from "./shows/controller";
import { createShowsStore } from "./shows/store";
import { renderThreeDemoRoute } from "./three-demo/scene";

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
          <li><a class="menu-link" data-route="/shows" href="#/shows">Shows</a></li>
          <li><a class="menu-link" data-route="/shows-crud" href="#/shows-crud">Shows CRUD</a></li>
          <li><a class="menu-link" data-route="/three-demo" href="#/three-demo">Three.js Demo</a></li>
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


function renderThreeRoute() {
  return renderThreeDemoRoute(routeContent);
}

const routes = {
  "/": renderHomeRoute,
  "/shows": renderShowsRoute,
  "/shows-crud": renderShowsCrudRoute,
  "/three-demo": renderThreeRoute,
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
