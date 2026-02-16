import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function renderThreeDemoRoute(container) {
  container.innerHTML = `
    <p class="hero-label">Three.js Demo</p>
    <h1 class="hero-title">Stacked cubes scene</h1>
    <p class="hero-subtitle">Drag to orbit around the cubes. Scroll to zoom and right-click to pan.</p>
    <div class="three-demo-canvas-wrap" id="three-demo-canvas-wrap" aria-label="Three-dimensional demo scene"></div>
  `;

  const canvasWrap = container.querySelector("#three-demo-canvas-wrap");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e2e8f0");

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(3.5, 3.5, 4.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasWrap.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
  directionalLight.position.set(5, 6, 4);
  scene.add(directionalLight);

  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeColors = ["#ef4444", "#3b82f6", "#22c55e"];
  const cubeMaterials = cubeColors.map((color) => new THREE.MeshStandardMaterial({ color }));

  const cubes = cubeMaterials.map((material, index) => {
    const cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.y = index * 1.1;
    scene.add(cube);
    return cube;
  });

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({ color: "#cbd5e1", roughness: 0.9, metalness: 0.05 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.85;
  scene.add(ground);

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

    cubes.forEach((cube, index) => {
      cube.rotation.x += 0.005 + index * 0.0015;
      cube.rotation.y += 0.008 + index * 0.001;
    });

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
    cubeGeometry.dispose();
    ground.geometry.dispose();
    ground.material.dispose();
    cubeMaterials.forEach((material) => material.dispose());
    renderer.dispose();
    canvasWrap.innerHTML = "";
  };
}
