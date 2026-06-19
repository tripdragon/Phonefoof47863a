import { Application, Container, Graphics, Text } from "pixi.js";

const FLIGHT_DURATION_SECONDS = 4;
const GLITCH_DURATION_SECONDS = 0.25;

function drawChicken(chicken) {
  chicken.clear();

  // Wing shadow and body use chunky shapes for a playful pixel-art chicken.
  chicken.ellipse(0, 8, 66, 42);
  chicken.fill({ color: 0xf8fafc });
  chicken.stroke({ width: 6, color: 0x94a3b8 });

  chicken.circle(46, -18, 30);
  chicken.fill({ color: 0xffffff });
  chicken.stroke({ width: 6, color: 0x94a3b8 });

  chicken.ellipse(-16, 16, 34, 24);
  chicken.fill({ color: 0xe2e8f0 });
  chicken.stroke({ width: 4, color: 0x94a3b8 });

  chicken.circle(55, -25, 4);
  chicken.fill({ color: 0x111827 });

  chicken.poly([72, -18, 110, -8, 72, 4]);
  chicken.fill({ color: 0xf59e0b });
  chicken.stroke({ width: 4, color: 0xb45309 });

  chicken.circle(32, -47, 10);
  chicken.circle(46, -52, 12);
  chicken.circle(60, -45, 10);
  chicken.fill({ color: 0xef4444 });
  chicken.stroke({ width: 3, color: 0x991b1b });

  chicken.rect(-52, 36, 8, 26);
  chicken.rect(16, 36, 8, 26);
  chicken.fill({ color: 0xf59e0b });
  chicken.rect(-64, 58, 24, 7);
  chicken.rect(6, 58, 24, 7);
  chicken.fill({ color: 0xb45309 });
}

function drawTrail(trail) {
  trail.clear();
  [0, 1, 2].forEach((index) => {
    trail.roundRect(-170 - index * 54, -17 + index * 13, 78 - index * 10, 12, 8);
    trail.fill({ color: 0xc7d2fe, alpha: 0.58 - index * 0.13 });
  });
}

function drawGlitch(glitch, width, height, intensity) {
  glitch.clear();

  if (intensity <= 0) {
    return;
  }

  const bands = 10;
  for (let index = 0; index < bands; index += 1) {
    const bandHeight = 5 + ((index * 7) % 18);
    const y = (index * 43 + Math.sin(intensity * 20 + index) * 22) % height;
    const offset = Math.sin(intensity * 31 + index * 2.3) * 42;
    const color = index % 3 === 0 ? 0xff00d4 : index % 3 === 1 ? 0x00f5ff : 0xfacc15;

    glitch.rect(offset, y, width, bandHeight);
    glitch.fill({ color, alpha: 0.18 + intensity * 0.22 });
  }

  glitch.rect(0, 0, width, height);
  glitch.stroke({ width: 6, color: 0xff00d4, alpha: intensity * 0.55 });
}

export function renderAni1Route(routeContent) {
  routeContent.innerHTML = `
    <p class="hero-label">PixiJS animation</p>
    <h1 class="hero-title">ani1: looping glitch chicken</h1>
    <p class="hero-subtitle">A chicken flies across the canvas every four seconds. When it crosses the center, the whole canvas glitches and jitters for a quarter second.</p>
    <section class="ani1-stage-card" aria-label="PixiJS flying chicken animation">
      <div id="ani1-canvas" class="ani1-canvas"></div>
      <div class="ani1-readout" aria-live="polite">
        <span>Loop: ${FLIGHT_DURATION_SECONDS}s fly-by</span>
        <span id="ani1-angle">Glitch: armed</span>
      </div>
    </section>
    <div class="hero-controls">
      <a class="action" href="#/" aria-label="Go to home">Back home</a>
    </div>
  `;

  const host = routeContent.querySelector("#ani1-canvas");
  const glitchReadout = routeContent.querySelector("#ani1-angle");
  const app = new Application();
  let destroyed = false;

  app
    .init({
      width: 720,
      height: 420,
      background: "#eef2ff",
      antialias: false,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    })
    .then(() => {
      if (destroyed) {
        app.destroy(true);
        return;
      }

      host.append(app.canvas);

      const scene = new Container();
      app.stage.addChild(scene);

      const sky = new Graphics();
      sky.rect(0, 0, app.screen.width, app.screen.height);
      sky.fill({ color: 0xeef2ff });
      sky.circle(120, 78, 34);
      sky.circle(155, 74, 46);
      sky.circle(196, 82, 32);
      sky.fill({ color: 0xffffff, alpha: 0.78 });
      sky.circle(520, 132, 28);
      sky.circle(552, 126, 38);
      sky.circle(590, 136, 30);
      sky.fill({ color: 0xffffff, alpha: 0.62 });
      scene.addChild(sky);

      const trail = new Graphics();
      drawTrail(trail);
      scene.addChild(trail);

      const chicken = new Graphics();
      drawChicken(chicken);
      scene.addChild(chicken);

      const caption = new Text({
        text: "CLUCK.EXE",
        style: {
          fill: 0x312e81,
          fontFamily: "system-ui, sans-serif",
          fontSize: 18,
          fontWeight: "800",
          letterSpacing: 2,
        },
      });
      caption.anchor.set(0.5);
      caption.position.set(app.screen.width / 2, app.screen.height - 42);
      scene.addChild(caption);

      const glitch = new Graphics();
      app.stage.addChild(glitch);

      app.ticker.add((ticker) => {
        const elapsed = ticker.lastTime / 1000;
        const cycleTime = elapsed % FLIGHT_DURATION_SECONDS;
        const progress = cycleTime / FLIGHT_DURATION_SECONDS;
        const centerTime = FLIGHT_DURATION_SECONDS / 2;
        const glitchAge = Math.abs(cycleTime - centerTime);
        const glitchActive = glitchAge <= GLITCH_DURATION_SECONDS / 2;
        const glitchIntensity = glitchActive ? 1 - glitchAge / (GLITCH_DURATION_SECONDS / 2) : 0;
        const wingFlap = Math.sin(elapsed * 18);

        chicken.position.set(-135 + progress * (app.screen.width + 270), app.screen.height / 2 + Math.sin(elapsed * 5) * 22);
        chicken.scale.set(1, 1 + wingFlap * 0.025);
        chicken.rotation = Math.sin(elapsed * 4) * 0.08;
        trail.position.copyFrom(chicken.position);

        if (glitchActive) {
          const shakeX = Math.sin(elapsed * 115) * 10 * glitchIntensity;
          const shakeY = Math.cos(elapsed * 93) * 7 * glitchIntensity;
          scene.position.set(shakeX, shakeY);
          drawGlitch(glitch, app.screen.width, app.screen.height, glitchIntensity);
          glitchReadout.textContent = "Glitch: jittering";
        } else {
          scene.position.set(0, 0);
          drawGlitch(glitch, app.screen.width, app.screen.height, 0);
          glitchReadout.textContent = "Glitch: armed";
        }
      });
    });

  return () => {
    destroyed = true;
    app.destroy(true, { children: true });
  };
}
