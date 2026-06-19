import { Application, Container, Graphics, Text } from "pixi.js";

function drawArm(arm, length) {
  arm.clear();
  arm.roundRect(0, -18, length, 36, 18);
  arm.fill({ color: 0x6366f1 });
  arm.stroke({ width: 4, color: 0x312e81 });

  arm.circle(length - 9, 0, 9);
  arm.fill({ color: 0xc7d2fe });
}

function drawJoint(joint) {
  joint.clear();
  joint.circle(0, 0, 30);
  joint.fill({ color: 0xf97316 });
  joint.stroke({ width: 5, color: 0x9a3412 });
  joint.circle(0, 0, 12);
  joint.fill({ color: 0xffedd5 });
}

function drawTorso(torso) {
  torso.clear();
  torso.roundRect(-44, 24, 88, 128, 22);
  torso.fill({ color: 0x0f172a });
  torso.stroke({ width: 4, color: 0x38bdf8 });
  torso.circle(0, 0, 48);
  torso.fill({ color: 0x1e293b });
}

export function renderAni1Route(routeContent) {
  routeContent.innerHTML = `
    <p class="hero-label">PixiJS animation</p>
    <h1 class="hero-title">ani1: rotating hinged arm</h1>
    <p class="hero-subtitle">A small PixiJS scene with an arm rotating around a shoulder hinge joint.</p>
    <section class="ani1-stage-card" aria-label="PixiJS rotating arm animation">
      <div id="ani1-canvas" class="ani1-canvas"></div>
      <div class="ani1-readout" aria-live="polite">
        <span>Shoulder hinge: fixed pivot</span>
        <span id="ani1-angle">Angle: 0°</span>
      </div>
    </section>
    <div class="hero-controls">
      <a class="action" href="#/" aria-label="Go to home">Back home</a>
    </div>
  `;

  const host = routeContent.querySelector("#ani1-canvas");
  const angleReadout = routeContent.querySelector("#ani1-angle");
  const app = new Application();
  let destroyed = false;

  app
    .init({
      width: 720,
      height: 420,
      background: "#eef2ff",
      antialias: true,
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
      scene.position.set(app.screen.width / 2, app.screen.height / 2 - 10);
      app.stage.addChild(scene);

      const torso = new Graphics();
      drawTorso(torso);
      scene.addChild(torso);

      const shoulder = new Container();
      shoulder.position.set(32, -6);
      scene.addChild(shoulder);

      const arm = new Graphics();
      drawArm(arm, 210);
      shoulder.addChild(arm);

      const joint = new Graphics();
      drawJoint(joint);
      shoulder.addChild(joint);

      const label = new Text({
        text: "pivot",
        style: {
          fill: 0x312e81,
          fontFamily: "system-ui, sans-serif",
          fontSize: 16,
          fontWeight: "700",
        },
      });
      label.anchor.set(0.5);
      label.position.set(0, -52);
      shoulder.addChild(label);

      app.ticker.add((ticker) => {
        const elapsed = ticker.lastTime / 1000;
        shoulder.rotation = Math.sin(elapsed * 1.6) * 0.95;
        const degrees = Math.round((shoulder.rotation * 180) / Math.PI);
        angleReadout.textContent = `Angle: ${degrees}°`;
      });
    });

  return () => {
    destroyed = true;
    app.destroy(true, { children: true });
  };
}
