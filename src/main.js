import "./style.css";
import { renderShowsSection } from "./shows/controller";

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
          <li><a class="menu-link" href="#/home">Home</a></li>
          <li><a class="menu-link" href="#/shows">Shows</a></li>
          <li><a class="menu-link" href="./threejs-demo.html">33333d</a></li>
          <li><a class="menu-link" href="./example-2.html">Example 2</a></li>
        </ul>
      </nav>
      <p class="hero-label" id="hero-kicker"></p>
      <h1 class="hero-title" id="hero-title"></h1>
      <p class="hero-subtitle" id="hero-subtitle"></p>
      <div class="hero-controls" id="hero-controls"></div>
      <a class="action" href="#/shows" aria-label="Go to shows">Manage shows</a>
    </section>
    <section id="shows-section" class="hidden"></section>
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

const heroKicker = document.getElementById("hero-kicker");
const heroTitle = document.getElementById("hero-title");
const heroSubtitle = document.getElementById("hero-subtitle");
const heroControls = document.getElementById("hero-controls");
const homeSection = document.getElementById("home-section");
const showsSection = document.getElementById("shows-section");

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

function renderRoute() {
  const route = window.location.hash || "#/home";
  const isShowsRoute = route === "#/shows";

  homeSection.classList.toggle("hidden", isShowsRoute);
  showsSection.classList.toggle("hidden", !isShowsRoute);

  if (isShowsRoute) {
    renderShowsSection(showsSection);
  }
}

renderSlide(currentSlide);
setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  renderSlide(currentSlide);
}, 4000);

window.addEventListener("hashchange", renderRoute);
renderRoute();
