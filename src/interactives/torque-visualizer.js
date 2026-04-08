import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function renderTorqueVisualizerRoute(container) {
  container.innerHTML = `
    <p class="hero-label">Three.js Interactive</p>
    <h1 class="hero-title">Torque Visualizer</h1>
    <p class="hero-subtitle">Use sliders or number fields to set lever arm, force, and angle. Orbit/zoom the scene to inspect torque direction.</p>

    <section class="torque-controls" aria-label="Torque controls">
      <div class="torque-controls-grid">
        <label class="torque-control">
          <span>Lever arm r (m)</span>
          <div class="torque-input-row">
            <input data-pair="arm" data-kind="number" type="number" min="0.4" max="6" step="0.1" value="2.5" />
            <input data-pair="arm" data-kind="range" type="range" min="0.4" max="6" step="0.1" value="2.5" />
          </div>
        </label>

        <label class="torque-control">
          <span>Force F (N)</span>
          <div class="torque-input-row">
            <input data-pair="force" data-kind="number" type="number" min="0" max="60" step="0.5" value="18" />
            <input data-pair="force" data-kind="range" type="range" min="0" max="60" step="0.5" value="18" />
          </div>
        </label>

        <label class="torque-control">
          <span>Angle θ (deg)</span>
          <div class="torque-input-row">
            <input data-pair="angle" data-kind="number" type="number" min="-180" max="180" step="1" value="65" />
            <input data-pair="angle" data-kind="range" type="range" min="-180" max="180" step="1" value="65" />
          </div>
        </label>
      </div>

      <p class="torque-readout" id="torque-readout" aria-live="polite"></p>
    </section>

    <div class="three-demo-canvas-wrap" id="torque-canvas-wrap" aria-label="Torque 3D scene"></div>
  `;

  const canvasWrap = container.querySelector("#torque-canvas-wrap");
  const readout = container.querySelector("#torque-readout");
  const pairedInputs = [...container.querySelectorAll("input[data-pair]")];

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e2e8f0");

  const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 120);
  camera.position.set(5.8, 4.8, 6.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasWrap.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.8, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
  keyLight.position.set(6, 8, 4);
  scene.add(keyLight);

  scene.add(new THREE.GridHelper(14, 14, 0x64748b, 0x94a3b8));
  scene.add(new THREE.AxesHelper(3));

  const pivot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.3, 32),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 }),
  );
  pivot.position.y = 0.15;
  scene.add(pivot);

  const lever = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1, 20),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35 }),
  );
  lever.rotation.z = Math.PI / 2;
  lever.position.y = 0.15;
  scene.add(lever);

  const handle = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e40af, emissive: 0x1d4ed8, emissiveIntensity: 0.25 }),
  );
  handle.position.y = 0.15;
  scene.add(handle);

  const forceArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 1, 0x16a34a, 0.22, 0.11);
  const radialArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0x2563eb, 0.22, 0.11);
  const torqueArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0.2, 0), 1, 0xdc2626, 0.2, 0.1);
  scene.add(forceArrow, radialArrow, torqueArrow);

  const state = { arm: 2.5, force: 18, angle: 65 };

  function syncInputs(pair, value) {
    pairedInputs
      .filter((input) => input.dataset.pair === pair)
      .forEach((input) => {
        input.value = String(value);
      });
  }

  function updateScene() {
    const arm = clamp(state.arm, 0.4, 6);
    const force = clamp(state.force, 0, 60);
    const angleDeg = clamp(state.angle, -180, 180);
    const angleRad = THREE.MathUtils.degToRad(angleDeg);

    state.arm = arm;
    state.force = force;
    state.angle = angleDeg;

    const handlePosition = new THREE.Vector3(arm, 0.15, 0);
    handle.position.copy(handlePosition);

    lever.scale.set(arm, 1, 1);
    lever.position.set(arm / 2, 0.15, 0);

    const forceDirection = new THREE.Vector3(Math.cos(angleRad), Math.sin(angleRad), 0).normalize();
    const forceLength = Math.max(0.5, force * 0.08);
    forceArrow.position.copy(handlePosition);
    forceArrow.setDirection(forceDirection);
    forceArrow.setLength(forceLength, 0.22, 0.11);

    radialArrow.position.set(0, 0.15, 0);
    radialArrow.setDirection(new THREE.Vector3(1, 0, 0));
    radialArrow.setLength(arm, 0.22, 0.11);

    const torqueValue = arm * force * Math.sin(angleRad);
    const torqueMagnitude = Math.abs(torqueValue);
    const torqueDirection = torqueValue >= 0 ? 1 : -1;

    torqueArrow.position.set(0, 0.15, 0);
    torqueArrow.setDirection(new THREE.Vector3(0, 0, torqueDirection));
    torqueArrow.setLength(Math.max(0.6, torqueMagnitude * 0.06), 0.22, 0.11);

    readout.textContent = `τ = rFsin(θ) = ${arm.toFixed(2)} × ${force.toFixed(2)} × sin(${angleDeg.toFixed(0)}°) = ${torqueValue.toFixed(2)} N·m`;
  }

  function onInput(event) {
    const target = event.target;
    const pair = target.dataset.pair;
    if (!pair) return;

    const value = toNumber(target.value, state[pair]);
    state[pair] = value;
    syncInputs(pair, value);
    updateScene();
  }

  pairedInputs.forEach((input) => input.addEventListener("input", onInput));

  function resizeRenderer() {
    const width = canvasWrap.clientWidth;
    const height = canvasWrap.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  let animationFrameId = null;
  function animate() {
    animationFrameId = window.requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  updateScene();
  resizeRenderer();
  animate();

  window.addEventListener("resize", resizeRenderer);

  return () => {
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
    }

    window.removeEventListener("resize", resizeRenderer);
    pairedInputs.forEach((input) => input.removeEventListener("input", onInput));

    controls.dispose();
    renderer.dispose();

    scene.traverse((node) => {
      if (node.isMesh) {
        node.geometry?.dispose?.();
        if (Array.isArray(node.material)) {
          node.material.forEach((material) => material.dispose?.());
        } else {
          node.material?.dispose?.();
        }
      }
    });

    canvasWrap.innerHTML = "";
  };
}
