import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Primitives } from "superneatlib";

export function renderSuperneatDemoRoute(container) {
  container.innerHTML = `
    <p class="hero-label">Three.js + SuperNeatLib</p>
    <h1 class="hero-title">SuperNeat playground</h1>
    <p class="hero-subtitle">Orbit around a simple scene built with SuperNeatLib primitives, a ground helper, and soft lighting.</p>
    <div class="three-demo-canvas-wrap" id="superneat-demo-canvas" aria-label="SuperNeatLib three-dimensional demo"></div>
  `;

  const canvasWrap = container.querySelector("#superneat-demo-canvas");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e0f2fe");

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(5, 4, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasWrap.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.8, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(4, 6, 3);
  scene.add(keyLight);

  const groundHelper = new THREE.GridHelper(16, 16, 0x3b82f6, 0x93c5fd);
  scene.add(groundHelper);

  const pedestal = Primitives.cube({ scale: 1.2, color: 0x6366f1 });
  pedestal.position.set(0, 0.6, 0);
  scene.add(pedestal);

  const orb = Primitives.ball({ scale: 0.8, color: 0x0ea5e9 });
  orb.position.set(0, 1.9, 0);
  scene.add(orb);

  const groundPlane = Primitives.plane({ scale: 12, color: 0xdbeafe });
  groundPlane.position.y = -0.01;
  scene.add(groundPlane);

  let animationFrameId = null;

  function resizeRenderer() {
    const width = canvasWrap.clientWidth;
    const height = canvasWrap.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function animate() {
    animationFrameId = window.requestAnimationFrame(animate);
    pedestal.rotation.y += 0.01;
    orb.position.y = 1.9 + Math.sin(performance.now() * 0.0025) * 0.18;
    controls.update();
    renderer.render(scene, camera);
  }

  resizeRenderer();
  animate();
  window.addEventListener("resize", resizeRenderer);

  return () => {
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
    }

    window.removeEventListener("resize", resizeRenderer);
    controls.dispose();
    renderer.dispose();
    canvasWrap.innerHTML = "";
  };
}
