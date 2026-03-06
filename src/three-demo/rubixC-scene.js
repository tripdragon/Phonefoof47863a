import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Primitives } from "superneatlib";

export function renderRubixCRoute(container) {
  container.innerHTML = `
    <p class="hero-label">Three.js + SuperNeatLib</p>
    <h1 class="hero-title">777@5554433@2b q e01@ rubixC 2</h1>
    <p class="hero-subtitle">A simple cube scene with orbit controls.</p>
    <div class="three-demo-canvas-wrap" id="rubixc-canvas-wrap" aria-label="RubixC cube demo"></div>
  `;
const plane = Primitives.plane;
  
  const canvasWrap = container.querySelector("#rubixc-canvas-wrap");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e2e8f0");

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(3, 2.5, 3.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasWrap.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(4, 5, 3);
  scene.add(keyLight);

  const cube = Primitives.cube({ scale: 1.4, color: 0xff0000 });
 // scene.add(cube);

  const colors = {w:0xffffff,r:0xff0000,
    g:0x00ff00,b:0x0000ff,o:0xffbb00,y:0x00ffff
               };
   
  const i1 = new THREE.Group();
  scene.add(i1);
  i1.position.y = 1;
  {
  let p1 = plane({scale:1,color:colors.w});
  i1.add(p1);
  let p2 = plane({scale:1,color:colors.o});
  i1.add(p2);
  p2.rotation.x = Math.PI * 0.5;
  p2.rotation.z = Math.PI * 0.5;
  p2.position.y = -0.5;
  p2.position.x = 0.5;
  
  let p3 = plane({scale:1,color:colors.b});
  i1.add(p3);
  p3.rotation.y = Math.PI * 0.5;
  p3.rotation.z = Math.PI * 0.5;
  p3.position.y = -0.5;
  p3.position.z = -0.5;
    
  
  }

  const grid = new THREE.GridHelper(10, 10, 0x94a3b8, 0xcbd5e1);
  //grid.position.y = -1.1;
  scene.add(grid);

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
    cube.rotation.x += 0.004;
    cube.rotation.y += 0.007;
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
