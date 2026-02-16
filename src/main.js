import "./style.css";
import { createShowsController } from "./shows/controller.js";

const appVersion = `v${__APP_VERSION__}`;

document.querySelector("#app").innerHTML = `
  <main>
    <section class="hero" aria-live="polite">
      <nav class="menu" aria-label="Primary">
        <div class="brand-wrap">
          <span class="brand">Phonefoof</span>
          <span class="version" aria-label="Application version">${appVersion}</span>
        </div>
        <ul class="menu-list">
          <li><a class="menu-link" href="./threejs-demo.html">33333d</a></li>
          <li><a class="menu-link" href="./example-2.html">Example 2</a></li>
          <li><a class="menu-link" href="#">Calls</a></li>
          <li><a class="menu-link" href="#">Analytics</a></li>
          <li><a class="menu-link" href="#">Settings</a></li>
        </ul>
      </nav>
      <p class="hero-label" id="hero-kicker"></p>
      <h1 class="hero-title" id="hero-title"></h1>
      <p class="hero-subtitle" id="hero-subtitle"></p>
      <div class="hero-controls" id="hero-controls"></div>
      <a class="action" href="#" aria-label="Get started">Get started</a>
    </section>
    <section id="shows-app"></section>
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
    kicker: "Built for speed",
    title: "Keep focus with a rotating, message-driven hero",
    subtitle: "Each spotlight message refreshes automatically every 4 seconds, with manual controls.",
  },
];

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

setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  renderSlide(currentSlide);
}, 4000);

const showsStore = (() => {
  let shows = [
    {
      id: crypto.randomUUID(),
      title: "Launch Recap",
      description: "Weekly review of support calls and incidents.",
    },
    {
      id: crypto.randomUUID(),
      title: "Roadmap Live",
      description: "Upcoming feature prioritization and release notes.",
    },
  ];

  return {
    async createShow(payload) {
      shows = [...shows, { ...payload, id: crypto.randomUUID() }];
    },
    async getShows() {
      return [...shows];
    },
    async updateShow(id, updates) {
      shows = shows.map((show) => (show.id === id ? { ...show, ...updates } : show));
    },
    async deleteShow(id) {
      shows = shows.filter((show) => show.id !== id);
    },
  };
})();

const showsRoot = document.getElementById("shows-app");
if (showsRoot) {
  const controller = createShowsController({ root: showsRoot, store: showsStore });
  controller.init();
}
