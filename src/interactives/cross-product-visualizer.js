import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";

const VECTOR_LIMIT = 5;

function clampVector(vector) {
  vector.x = THREE.MathUtils.clamp(vector.x, -VECTOR_LIMIT, VECTOR_LIMIT);
  vector.y = THREE.MathUtils.clamp(vector.y, -VECTOR_LIMIT, VECTOR_LIMIT);
  vector.z = THREE.MathUtils.clamp(vector.z, -VECTOR_LIMIT, VECTOR_LIMIT);
}

function formatVector(vector) {
  return `(${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}, ${vector.z.toFixed(2)})`;
}

export function renderCrossProductVisualizerRoute(container) {
  container.innerHTML = `
    <p class="hero-label">Three.js Interactive</p>
    <h1 class="hero-title">Cross Product Visualizer</h1>
    <p class="hero-subtitle">Edit vectors in the fields or drag the tip handles in 3D. Orbit with mouse drag, zoom with wheel.</p>

    <section class="cross-product-controls" aria-label="Cross product vector controls">
      <div class="cross-product-grid">
        <fieldset class="cross-fieldset">
          <legend>Vector A</legend>
          <label>Ax <input data-vector="a" data-axis="x" type="number" step="0.1" value="2" /></label>
          <label>Ay <input data-vector="a" data-axis="y" type="number" step="0.1" value="1" /></label>
          <label>Az <input data-vector="a" data-axis="z" type="number" step="0.1" value="0" /></label>
        </fieldset>
        <fieldset class="cross-fieldset">
          <legend>Vector B</legend>
          <label>Bx <input data-vector="b" data-axis="x" type="number" step="0.1" value="1" /></label>
          <label>By <input data-vector="b" data-axis="y" type="number" step="0.1" value="2" /></label>
          <label>Bz <input data-vector="b" data-axis="z" type="number" step="0.1" value="1" /></label>
        </fieldset>
      </div>
      <p class="cross-product-readout" id="cross-product-readout" aria-live="polite"></p>
    </section>

    <div class="three-demo-canvas-wrap" id="cross-product-canvas-wrap" aria-label="Cross product Three.js scene"></div>
  `;

  const canvasWrap = container.querySelector("#cross-product-canvas-wrap");
  const readout = container.querySelector("#cross-product-readout");
  const inputElements = Array.from(container.querySelectorAll("input[data-vector][data-axis]"));

  const vectorA = new THREE.Vector3(2, 1, 0);
  const vectorB = new THREE.Vector3(1, 2, 1);
  const crossVector = new THREE.Vector3();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e2e8f0");

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(6, 5, 7);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasWrap.appendChild(renderer.domElement);

  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.target.set(0, 0.6, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(5, 7, 4);
  scene.add(keyLight);

  const grid = new THREE.GridHelper(14, 14, 0x64748b, 0x94a3b8);
  scene.add(grid);
  scene.add(new THREE.AxesHelper(4));

  const origin = new THREE.Vector3(0, 0, 0);
  const arrowA = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1, 0x2563eb, 0.25, 0.12);
  const arrowB = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, 1, 0x16a34a, 0.25, 0.12);
  const arrowCross = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, 1, 0xdc2626, 0.25, 0.12);
  scene.add(arrowA, arrowB, arrowCross);

  const handleGeometry = new THREE.SphereGeometry(0.16, 24, 24);
  const handleMaterialA = new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1e40af, emissiveIntensity: 0.2 });
  const handleMaterialB = new THREE.MeshStandardMaterial({ color: 0x16a34a, emissive: 0x166534, emissiveIntensity: 0.2 });

  const handleA = new THREE.Mesh(handleGeometry, handleMaterialA);
  const handleB = new THREE.Mesh(handleGeometry, handleMaterialB);
  handleA.userData.vectorKey = "a";
  handleB.userData.vectorKey = "b";
  scene.add(handleA, handleB);

  const dragControls = new DragControls([handleA, handleB], camera, renderer.domElement);

  function syncInputsFromVectors() {
    inputElements.forEach((input) => {
      const vector = input.dataset.vector === "a" ? vectorA : vectorB;
      input.value = vector[input.dataset.axis].toFixed(2);
    });
  }

  function updateArrowsAndReadout() {
    const lengthA = Math.max(vectorA.length(), 0.001);
    const lengthB = Math.max(vectorB.length(), 0.001);

    arrowA.setDirection(vectorA.clone().normalize());
    arrowA.setLength(lengthA, 0.25, 0.12);

    arrowB.setDirection(vectorB.clone().normalize());
    arrowB.setLength(lengthB, 0.25, 0.12);

    crossVector.copy(vectorA).cross(vectorB);
    const crossLength = Math.max(crossVector.length(), 0.001);
    arrowCross.setDirection(crossVector.clone().normalize());
    arrowCross.setLength(crossLength, 0.25, 0.12);

    handleA.position.copy(vectorA);
    handleB.position.copy(vectorB);

    readout.textContent = `A × B = ${formatVector(crossVector)} | |A × B| = ${crossVector.length().toFixed(3)}`;
  }

  function onInputChange(event) {
    const input = event.target;
    const nextValue = Number.parseFloat(input.value);

    if (!Number.isFinite(nextValue)) {
      return;
    }

    const targetVector = input.dataset.vector === "a" ? vectorA : vectorB;
    targetVector[input.dataset.axis] = nextValue;
    clampVector(targetVector);
    syncInputsFromVectors();
    updateArrowsAndReadout();
  }

  function onDragStart() {
    orbitControls.enabled = false;
  }

  function onDrag(event) {
    const key = event.object.userData.vectorKey;
    const targetVector = key === "a" ? vectorA : vectorB;
    targetVector.copy(event.object.position);
    clampVector(targetVector);
    event.object.position.copy(targetVector);
    syncInputsFromVectors();
    updateArrowsAndReadout();
  }

  function onDragEnd() {
    orbitControls.enabled = true;
  }

  inputElements.forEach((input) => input.addEventListener("input", onInputChange));
  dragControls.addEventListener("dragstart", onDragStart);
  dragControls.addEventListener("drag", onDrag);
  dragControls.addEventListener("dragend", onDragEnd);

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
    orbitControls.update();
    renderer.render(scene, camera);
  }

  syncInputsFromVectors();
  updateArrowsAndReadout();
  resizeRenderer();
  animate();
  window.addEventListener("resize", resizeRenderer);

  return () => {
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
    }

    window.removeEventListener("resize", resizeRenderer);
    inputElements.forEach((input) => input.removeEventListener("input", onInputChange));
    dragControls.removeEventListener("dragstart", onDragStart);
    dragControls.removeEventListener("drag", onDrag);
    dragControls.removeEventListener("dragend", onDragEnd);

    dragControls.dispose();
    orbitControls.dispose();
    handleGeometry.dispose();
    handleMaterialA.dispose();
    handleMaterialB.dispose();
    renderer.dispose();
    canvasWrap.innerHTML = "";
  };
}
