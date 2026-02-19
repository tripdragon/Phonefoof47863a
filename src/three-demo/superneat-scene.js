import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Primitives } from "superneatlib";

export function renderSuperneatDemoRoute(container) {
  container.innerHTML = `
    <p class="hero-label">Three.js + SuperNeatLib</p>
    <h1 class="hero-title">SuperNeat playground</h1>
    <p class="hero-subtitle">Use arrow keys or the joystick to move the cube player around the arena.</p>
    <div class="three-demo-canvas-wrap" id="superneat-demo-canvas" aria-label="SuperNeatLib three-dimensional demo">
      <div class="superneat-joystick" id="superneat-joystick" role="group" aria-label="Movement joystick">
        <div class="superneat-joystick-thumb" id="superneat-joystick-thumb" aria-hidden="true"></div>
      </div>
    </div>
  `;

  const canvasWrap = container.querySelector("#superneat-demo-canvas");
  const joystick = container.querySelector("#superneat-joystick");
  const joystickThumb = container.querySelector("#superneat-joystick-thumb");

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

  const keyMoveState = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  const joystickState = {
    x: 0,
    y: 0,
    pointerId: null,
  };

  const moveSpeed = 0.08;
  const boundary = 5.25;

  let animationFrameId = null;

  function onKeyDown(event) {
    const key = event.key.toLowerCase();

    if (key === "arrowup" || key === "w") {
      keyMoveState.up = true;
    } else if (key === "arrowdown" || key === "s") {
      keyMoveState.down = true;
    } else if (key === "arrowleft" || key === "a") {
      keyMoveState.left = true;
    } else if (key === "arrowright" || key === "d") {
      keyMoveState.right = true;
    } else {
      return;
    }

    event.preventDefault();
  }

  function onKeyUp(event) {
    const key = event.key.toLowerCase();

    if (key === "arrowup" || key === "w") {
      keyMoveState.up = false;
    } else if (key === "arrowdown" || key === "s") {
      keyMoveState.down = false;
    } else if (key === "arrowleft" || key === "a") {
      keyMoveState.left = false;
    } else if (key === "arrowright" || key === "d") {
      keyMoveState.right = false;
    }
  }

  function updateJoystickVisual() {
    const bounds = joystick.getBoundingClientRect();
    const thumbHalfSize = joystickThumb.offsetWidth / 2;
    const travelRadius = bounds.width / 2 - thumbHalfSize - 4;
    const x = joystickState.x * travelRadius;
    const y = joystickState.y * travelRadius;
    joystickThumb.style.transform = `translate(${x}px, ${y}px)`;
  }

  function setJoystickFromPointer(clientX, clientY) {
    const bounds = joystick.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    const thumbHalfSize = joystickThumb.offsetWidth / 2;
    const maxDistance = bounds.width / 2 - thumbHalfSize - 4;
    const distance = Math.hypot(dx, dy);
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);

    const limitedDx = Math.cos(angle) * clampedDistance;
    const limitedDy = Math.sin(angle) * clampedDistance;

    joystickState.x = limitedDx / maxDistance;
    joystickState.y = limitedDy / maxDistance;

    updateJoystickVisual();
  }

  function resetJoystick() {
    joystickState.x = 0;
    joystickState.y = 0;
    joystickState.pointerId = null;
    updateJoystickVisual();
  }

  function onJoystickPointerDown(event) {
    event.preventDefault();
    joystickState.pointerId = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    setJoystickFromPointer(event.clientX, event.clientY);
  }

  function onJoystickPointerMove(event) {
    if (joystickState.pointerId !== event.pointerId) {
      return;
    }

    setJoystickFromPointer(event.clientX, event.clientY);
  }

  function onJoystickPointerEnd(event) {
    if (joystickState.pointerId !== event.pointerId) {
      return;
    }

    resetJoystick();
  }

  function resizeRenderer() {
    const width = canvasWrap.clientWidth;
    const height = canvasWrap.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    updateJoystickVisual();
  }

  function animate() {
    animationFrameId = window.requestAnimationFrame(animate);

    const keyboardX = Number(keyMoveState.right) - Number(keyMoveState.left);
    const keyboardZ = Number(keyMoveState.down) - Number(keyMoveState.up);

    const moveX = THREE.MathUtils.clamp(keyboardX + joystickState.x, -1, 1);
    const moveZ = THREE.MathUtils.clamp(keyboardZ + joystickState.y, -1, 1);

    if (moveX !== 0 || moveZ !== 0) {
      const nextX = pedestal.position.x + moveX * moveSpeed;
      const nextZ = pedestal.position.z + moveZ * moveSpeed;
      pedestal.position.x = THREE.MathUtils.clamp(nextX, -boundary, boundary);
      pedestal.position.z = THREE.MathUtils.clamp(nextZ, -boundary, boundary);
      pedestal.rotation.y = Math.atan2(moveX, moveZ || 0.0001);
    }

    orb.position.y = 1.9 + Math.sin(performance.now() * 0.0025) * 0.18;
    controls.update();
    renderer.render(scene, camera);
  }

  resizeRenderer();
  animate();

  window.addEventListener("resize", resizeRenderer);
  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp);

  joystick.addEventListener("pointerdown", onJoystickPointerDown);
  joystick.addEventListener("pointermove", onJoystickPointerMove);
  joystick.addEventListener("pointerup", onJoystickPointerEnd);
  joystick.addEventListener("pointercancel", onJoystickPointerEnd);

  return () => {
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
    }

    window.removeEventListener("resize", resizeRenderer);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);

    joystick.removeEventListener("pointerdown", onJoystickPointerDown);
    joystick.removeEventListener("pointermove", onJoystickPointerMove);
    joystick.removeEventListener("pointerup", onJoystickPointerEnd);
    joystick.removeEventListener("pointercancel", onJoystickPointerEnd);

    controls.dispose();
    renderer.dispose();
    canvasWrap.innerHTML = "";
  };
}
