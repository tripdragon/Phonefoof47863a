import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Primitives, AxisHelperWithLetters } from "superneatlib";
import { APP as _o } from "superneatlib";

function createTopWindowLogger(message) {
  const logBanner = document.createElement("output");
  logBanner.id = "superneat-top-log";
  logBanner.className = "superneat-top-log";
  logBanner.setAttribute("aria-live", "polite");
  logBanner.textContent = `Log: ${String(message)}`;
  document.body.appendChild(logBanner);

  return (nextMessage) => {
    logBanner.textContent = `Log: ${String(nextMessage)}`;
  };
}

export function renderSuperneatDemoRoute(container) {
  container.innerHTML = `
    <p class="hero-label">Three.js + SuperNeatLib</p>
    <h1 class="hero-title">SuperNeat playground</h1>
    <p class="hero-subtitle">Use arrow keys or the joystick to move through the maze and find the exit.</p>
    <p class="hero-label" id="superneat-status">Find the exit at the top opening.</p>
    <div class="three-demo-canvas-wrap" id="superneat-demo-canvas" aria-label="SuperNeatLib three-dimensional demo">
      <div class="superneat-joystick" id="superneat-joystick-world" role="group" aria-label="World movement joystick">
        <div class="superneat-joystick-thumb" id="superneat-joystick-world-thumb" aria-hidden="true"></div>
      </div>
      //<div class="superneat-joystick superneat-joystick-right" id="superneat-joystick-local" role="group" aria-label="Local movement joystick">
        //<div class="superneat-joystick-thumb" id="superneat-joystick-local-thumb" aria-hidden="true"></div>
      //</div>
    </div>
  `;

  const canvasWrap = container.querySelector("#superneat-demo-canvas");
  const worldJoystick = container.querySelector("#superneat-joystick-world");
  const worldJoystickThumb = container.querySelector("#superneat-joystick-world-thumb");
  const localJoystick = container.querySelector("#superneat-joystick-local");
  const localJoystickThumb = container.querySelector("#superneat-joystick-local-thumb");
  const statusLabel = container.querySelector("#superneat-status");
  const updateTopLog = createTopWindowLogger("SuperNeat demo ready");

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

  const mazeScale = 4;
  const scaleMazeValue = (value) => value * mazeScale;

  groundHelper.scale.setScalar(mazeScale);

  const pedestalScale = 1.1;
  const pedestal = Primitives.cube({ scale: pedestalScale, color: 0xfacc15 });
  pedestal.position.set(0, pedestalScale / 2, 0);

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.55, 16),
    new THREE.MeshStandardMaterial({ color: 0xf97316 }),
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, pedestalScale * 0.08, pedestalScale / 2 + 0.28);
  pedestal.add(nose);
  updateTopLog(_o?.version ?? "SuperNeatLib loaded");
  updateTopLog(_o?.camera ?? "cam");
  
  //AxisHelperWithLetters
  _o.camera = camera;
  const axis = new AxisHelperWithLetters({store:_o, size:2});
  pedestal.add(axis);
  
  scene.add(pedestal);

  const orb = Primitives.ball({ scale: 0.8, color: 0x0ea5e9 });
  const orbOffset = {
    x: -1,
    y: 2.3,
  };
  orb.position.set(pedestal.position.x + orbOffset.x, orbOffset.y, pedestal.position.z);
  scene.add(orb);

  const groundPlane = Primitives.plane({ scale: 12 * mazeScale, color: 0xdbeafe });
  groundPlane.position.y = -0.01;
  scene.add(groundPlane);

  const mazeWallMaterial = new THREE.MeshStandardMaterial({ color: 0x1d4ed8 });
  const wallHeight = 1.3;
  const mazeWalls = [];

  function addMazeWall(width, depth, x, z) {
    const scaledWidth = scaleMazeValue(width);
    const scaledDepth = scaleMazeValue(depth);
    const scaledX = scaleMazeValue(x);
    const scaledZ = scaleMazeValue(z);

    const clearSpaceWidth = pedestalScale * 4;
    const clearSpaceHalfWidth = clearSpaceWidth / 2;
    const overlapsStartClearSpace =
      Math.abs(scaledX) < clearSpaceHalfWidth + scaledWidth / 2 &&
      Math.abs(scaledZ) < clearSpaceHalfWidth + scaledDepth / 2;

    if (overlapsStartClearSpace) {
      return;
    }

    const wall = new THREE.Mesh(new THREE.BoxGeometry(scaledWidth, wallHeight, scaledDepth), mazeWallMaterial);
    wall.position.set(scaledX, wallHeight / 2, scaledZ);
    scene.add(wall);
    mazeWalls.push({
      mesh: wall,
      halfWidth: scaledWidth / 2,
      halfDepth: scaledDepth / 2,
    });
  }

  // Outer maze border with an exit gap at the top center.
  addMazeWall(4.4, 0.5, -3.1, -5.4);
  addMazeWall(4.4, 0.5, 3.1, -5.4);
  addMazeWall(10.8, 0.5, 0, 5.4);
  addMazeWall(0.5, 10.8, -5.4, 0);
  addMazeWall(0.5, 10.8, 5.4, 0);

  // Larger inner maze (more walkable branches and turns).
  addMazeWall(0.5, 8.2, -3.8, 0.8);
  addMazeWall(0.5, 7.2, -2.2, -1.6);
  addMazeWall(0.5, 8.4, -0.8, 1.1);
  addMazeWall(0.5, 7.4, 0.8, -1.2);
  addMazeWall(0.5, 8.0, 2.3, 0.5);
  addMazeWall(0.5, 6.6, 3.8, -1.8);

  addMazeWall(2.3, 0.5, -4.2, -2.8);
  addMazeWall(2.1, 0.5, -3.1, 2.8);
  addMazeWall(2.5, 0.5, -1.6, -4.0);
  addMazeWall(2.0, 0.5, -0.1, 3.7);
  addMazeWall(2.4, 0.5, 1.5, -2.9);
  addMazeWall(2.1, 0.5, 3.2, 2.2);
  addMazeWall(1.9, 0.5, 4.3, -4.0);

  const keyMoveState = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  const createJoystickState = () => ({
    x: 0,
    y: 0,
    pointerId: null,
  });

  const worldJoystickState = createJoystickState();
  const localJoystickState = createJoystickState();

  const moveSpeed = 0.08;
  const boundary = scaleMazeValue(6.2);
  const playerRadius = 0.6;
  const exitZone = {
    minX: scaleMazeValue(-1.1),
    maxX: scaleMazeValue(1.1),
    minZ: scaleMazeValue(-6.4),
    maxZ: scaleMazeValue(-5.35),
  };

  let animationFrameId = null;
  let hasExited = false;

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

  function updateJoystickVisual(joystick, joystickThumb, joystickState) {
    const bounds = joystick.getBoundingClientRect();
    const thumbHalfSize = joystickThumb.offsetWidth / 2;
    const travelRadius = bounds.width / 2 - thumbHalfSize - 4;
    const x = joystickState.x * travelRadius;
    const y = joystickState.y * travelRadius;
    joystickThumb.style.transform = `translate(${x}px, ${y}px)`;
  }

  function setJoystickFromPointer(clientX, clientY, joystick, joystickThumb, joystickState) {
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

    updateJoystickVisual(joystick, joystickThumb, joystickState);
  }

  function resetJoystick(joystick, joystickThumb, joystickState) {
    joystickState.x = 0;
    joystickState.y = 0;
    joystickState.pointerId = null;
    updateJoystickVisual(joystick, joystickThumb, joystickState);
  }

  function bindJoystick(joystick, joystickThumb, joystickState) {
    const onPointerDown = (event) => {
      event.preventDefault();
      joystickState.pointerId = event.pointerId;
      joystick.setPointerCapture(event.pointerId);
      setJoystickFromPointer(event.clientX, event.clientY, joystick, joystickThumb, joystickState);
    };

    const onPointerMove = (event) => {
      if (joystickState.pointerId !== event.pointerId) {
        return;
      }

      setJoystickFromPointer(event.clientX, event.clientY, joystick, joystickThumb, joystickState);
    };

    const onPointerEnd = (event) => {
      if (joystickState.pointerId !== event.pointerId) {
        return;
      }

      resetJoystick(joystick, joystickThumb, joystickState);
    };

    joystick.addEventListener("pointerdown", onPointerDown);
    joystick.addEventListener("pointermove", onPointerMove);
    joystick.addEventListener("pointerup", onPointerEnd);
    joystick.addEventListener("pointercancel", onPointerEnd);

    return () => {
      joystick.removeEventListener("pointerdown", onPointerDown);
      joystick.removeEventListener("pointermove", onPointerMove);
      joystick.removeEventListener("pointerup", onPointerEnd);
      joystick.removeEventListener("pointercancel", onPointerEnd);
    };
  }

  function resizeRenderer() {
    const width = canvasWrap.clientWidth;
    const height = canvasWrap.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    updateJoystickVisual(worldJoystick, worldJoystickThumb, worldJoystickState);
    updateJoystickVisual(localJoystick, localJoystickThumb, localJoystickState);
  }

  function animate() {
    animationFrameId = window.requestAnimationFrame(animate);

    const keyboardX = Number(keyMoveState.right) - Number(keyMoveState.left);
    const keyboardZ = Number(keyMoveState.down) - Number(keyMoveState.up);

    const worldMoveX = worldJoystickState.x;
    const worldMoveZ = worldJoystickState.y;

    const localInputX = localJoystickState.x;
    const localInputForward = -localJoystickState.y;
    const facingAngle = pedestal.rotation.y;
    const localMoveX =
      localInputX * Math.cos(facingAngle) +
      localInputForward * Math.sin(facingAngle);
    const localMoveZ =
      -localInputX * Math.sin(facingAngle) +
      localInputForward * Math.cos(facingAngle);

    const moveX = THREE.MathUtils.clamp(keyboardX + worldMoveX + localMoveX, -1, 1);
    const moveZ = THREE.MathUtils.clamp(keyboardZ + worldMoveZ + localMoveZ, -1, 1);

    if (moveX !== 0 || moveZ !== 0) {
      const nextX = pedestal.position.x + moveX * moveSpeed;
      const nextZ = pedestal.position.z + moveZ * moveSpeed;

      const clampedX = THREE.MathUtils.clamp(nextX, -boundary, boundary);
      const clampedZ = THREE.MathUtils.clamp(nextZ, -boundary, boundary);

      const collidesWithMaze = mazeWalls.some(({ mesh, halfWidth, halfDepth }) => {
        const dx = Math.abs(clampedX - mesh.position.x);
        const dz = Math.abs(clampedZ - mesh.position.z);
        return dx < halfWidth + playerRadius && dz < halfDepth + playerRadius;
      });

      if (!collidesWithMaze) {
        pedestal.position.x = clampedX;
        pedestal.position.z = clampedZ;
      }

      pedestal.rotation.y = Math.atan2(moveX, moveZ || 0.0001);
    }

    const inExitZone =
      pedestal.position.x >= exitZone.minX &&
      pedestal.position.x <= exitZone.maxX &&
      pedestal.position.z >= exitZone.minZ &&
      pedestal.position.z <= exitZone.maxZ;

    if (inExitZone && !hasExited) {
      hasExited = true;
      statusLabel.textContent = "You escaped the maze!";
      updateTopLog("You escaped the maze!");
      pedestal.material.color.set(0x22c55e);
    } else if (!inExitZone && hasExited) {
      hasExited = false;
      statusLabel.textContent = "Find the exit at the top opening.";
      updateTopLog("Back in maze");
      pedestal.material.color.set(0x6366f1);
    }

    orb.position.set(
      pedestal.position.x + orbOffset.x,
      orbOffset.y + Math.sin(performance.now() * 0.0025) * 0.18,
      pedestal.position.z,
    );
    controls.update();
    renderer.render(scene, camera);
  }

  resizeRenderer();
  const unbindWorldJoystick = bindJoystick(worldJoystick, worldJoystickThumb, worldJoystickState);
  const unbindLocalJoystick = bindJoystick(localJoystick, localJoystickThumb, localJoystickState);
  animate();

  window.addEventListener("resize", resizeRenderer);
  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp);

  return () => {
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
    }

    window.removeEventListener("resize", resizeRenderer);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);

    unbindWorldJoystick();
    unbindLocalJoystick();

    controls.dispose();
    renderer.dispose();
    canvasWrap.innerHTML = "";

    const topLog = document.querySelector("#superneat-top-log");
    if (topLog) {
      topLog.remove();
    }
  };
}
