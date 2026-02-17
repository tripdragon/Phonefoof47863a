import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


import { Primitives } from 'superneatlib';
// import {CheapPool} from './superneatlib.js';

// need to know how references
// import { APP as _o } from "superneatlib";

export function renderThreeDemoRoute(container) {
  container.innerHTML = `
    <p class="hero-label">Three.js Demo</p>
    <h1 class="hero-title">Stacked cubes scene</h1>
    <p class="hero-subtitle">Drag to orbit around the cubes. Scroll to zoom and right-click to pan.</p>
    <div class="three-demo-controls" aria-label="Three.js demo controls">
      <label class="three-demo-slider-label" for="cube-distance">
        Cube distance
        <output id="cube-distance-value" class="three-demo-slider-value">1.2</output>
      </label>
      <input
        id="cube-distance"
        class="three-demo-slider"
        type="range"
        min="0.7"
        max="3"
        step="0.1"
        value="1.2"
        aria-describedby="cube-distance-value"
      />
      <p class="three-demo-score-row">
        <span>Overlap score</span>
        <output id="cube-overlap-score" class="three-demo-score-value">0</output>
      </p>
    </div>
    <div class="three-demo-canvas-wrap" id="three-demo-canvas-wrap" aria-label="Three-dimensional demo scene"></div>
  `;

  const canvasWrap = container.querySelector("#three-demo-canvas-wrap");
  const distanceSlider = container.querySelector("#cube-distance");
  const distanceValue = container.querySelector("#cube-distance-value");
  const scoreValue = container.querySelector("#cube-overlap-score");
  let overlapScore = 0;
  scoreValue.textContent = String(overlapScore);
  const overlappingPairs = new Set();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e2e8f0");

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(3.5, 3.5, 4.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasWrap.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
  directionalLight.position.set(5, 6, 4);
  scene.add(directionalLight);

  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeColors = ["#ef4444", "#3b82f6", "#22c55e"];
  const cubeMaterials = cubeColors.map((color) => new THREE.MeshStandardMaterial({ color }));

  const cubes = cubeMaterials.map((material, index) => {
    const cube = new THREE.Mesh(cubeGeometry, material);
    scene.add(cube);
    return cube;
  });


  const ball = Primitives.ball({scale: 1.4, color: 0x44aaff});
  ball.position.y += 0.1;
  ball.position.z += 2.1;
  scene.add(ball);


  function updateCubeDistance(distance) {
    const centerOffset = (cubes.length - 1) / 2;
    cubes.forEach((cube, index) => {
      cube.position.set((index - centerOffset) * distance, 0, 0);
    });
    distanceValue.value = distance.toFixed(1);
  }

  function evaluateOverlaps({ countNewEvents = true } = {}) {
    for (let firstIndex = 0; firstIndex < cubes.length - 1; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < cubes.length; secondIndex += 1) {
        const pairKey = `${firstIndex}-${secondIndex}`;
        const cubeA = cubes[firstIndex];
        const cubeB = cubes[secondIndex];
        const isOverlapping = Math.abs(cubeA.position.x - cubeB.position.x) < 1;
        const wasOverlapping = overlappingPairs.has(pairKey);

        if (countNewEvents && isOverlapping && !wasOverlapping) {
          overlapScore += 1;
        }

        if (isOverlapping) {
          overlappingPairs.add(pairKey);
        } else {
          overlappingPairs.delete(pairKey);
        }
      }
    }

    scoreValue.textContent = String(overlapScore);
  }

  updateCubeDistance(Number(distanceSlider.value));
  // Prime overlap state after the initial position update without incrementing score.
  evaluateOverlaps({ countNewEvents: false });

  function onDistanceInput(event) {
    updateCubeDistance(Number(event.target.value));
    evaluateOverlaps();
  }

  distanceSlider.addEventListener("input", onDistanceInput);

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
    distanceSlider.removeEventListener("input", onDistanceInput);
    controls.dispose();
    cubeGeometry.dispose();
    cubeMaterials.forEach((material) => material.dispose());
    renderer.dispose();
    canvasWrap.innerHTML = "";
  };
}
