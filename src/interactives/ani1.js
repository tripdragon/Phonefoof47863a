import { Application, Container, Graphics, Text } from "pixi.js";

function drawArm(arm, length) {
  arm.clear();

  const pixel = 8;
  const sleeveLength = 82;
  const skinStart = sleeveLength - pixel;
  const handStart = length - 34;

  // Shirt sleeve, built from square blocks to keep a chunky pixel-art edge.
  arm.rect(0, -24, sleeveLength, 48);
  arm.fill({ color: 0x2563eb });
  arm.rect(0, -24, sleeveLength, pixel);
  arm.rect(0, 16, sleeveLength, pixel);
  arm.rect(0, -24, pixel, 48);
  arm.fill({ color: 0x1e3a8a });
  arm.rect(pixel, -16, sleeveLength - 24, pixel);
  arm.fill({ color: 0x60a5fa });
  arm.rect(sleeveLength - 16, -24, 16, 48);
  arm.fill({ color: 0xfacc15 });

  // Cartoon forearm with stepped highlights and a darker pixel outline.
  arm.rect(skinStart, -20, handStart - skinStart, 40);
  arm.fill({ color: 0xf2b880 });
  arm.rect(skinStart, -20, handStart - skinStart, pixel);
  arm.rect(skinStart, 12, handStart - skinStart, pixel);
  arm.rect(skinStart, -20, pixel, 40);
  arm.fill({ color: 0x9a5b32 });
  arm.rect(skinStart + pixel, -12, handStart - skinStart - 24, pixel);
  arm.fill({ color: 0xffd3a3 });

  // Blocky cartoon hand and four visible fingers.
  arm.rect(handStart, -22, 30, 44);
  arm.fill({ color: 0xf2b880 });
  arm.rect(handStart, -22, 30, pixel);
  arm.rect(handStart, 14, 30, pixel);
  arm.rect(handStart + 22, -14, pixel, 28);
  arm.fill({ color: 0x9a5b32 });

  const fingerBase = length - 6;
  [-22, -10, 2, 14].forEach((y, index) => {
    const fingerLength = index === 0 || index === 3 ? 18 : 24;
    arm.rect(fingerBase, y, fingerLength, 8);
    arm.fill({ color: 0xf2b880 });
    arm.rect(fingerBase + fingerLength - 4, y, 4, 8);
    arm.fill({ color: 0x9a5b32 });
    arm.rect(fingerBase + 4, y, 8, 3);
    arm.fill({ color: 0xffd3a3 });
  });
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
  torso.rect(-48, 16, 96, 144);
  torso.fill({ color: 0x1e3a8a });
  torso.rect(-48, 16, 96, 8);
  torso.rect(-48, 152, 96, 8);
  torso.rect(-48, 16, 8, 144);
  torso.rect(40, 16, 8, 144);
  torso.fill({ color: 0x172554 });
  torso.rect(-24, 24, 48, 16);
  torso.fill({ color: 0x60a5fa });
  torso.rect(-16, 40, 32, 24);
  torso.fill({ color: 0xfacc15 });
  torso.rect(-48, 16, 96, 16);
  torso.fill({ color: 0x2563eb });
  torso.rect(-40, 40, 16, 88);
  torso.fill({ color: 0x3b82f6 });
  torso.rect(-24, -48, 96, 96);
  torso.fill({ color: 0xf2b880 });
  torso.rect(-24, -48, 96, 8);
  torso.rect(-24, 40, 96, 8);
  torso.rect(-24, -48, 8, 96);
  torso.rect(64, -48, 8, 96);
  torso.fill({ color: 0x9a5b32 });
  torso.rect(-8, -32, 64, 16);
  torso.fill({ color: 0xffd3a3 });
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
