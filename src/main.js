import "./style.css";
import { renderShowsSection } from "./shows/controller";
import { createShowsStore } from "./shows/store";

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
    <a class="action" href="#/shows" aria-label="Open shows">View shows</a>
  `;

  const heroKicker = document.getElementById("hero-kicker");
  const heroTitle = document.getElementById("hero-title");
  const heroSubtitle = document.getElementById("hero-subtitle");
  const heroControls = document.getElementById("hero-controls");

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

  return () => window.clearInterval(intervalId);
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

const routes = {
  "/": renderHomeRoute,
  "/shows": renderShowsRoute,
  "/shows-crud": renderShowsCrudRoute,
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
