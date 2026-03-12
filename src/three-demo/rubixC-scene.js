import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Primitives, onConsole } from "superneatlib";
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.21/+esm';
import { RubixCubeLike } from "./rubixC/RubixCubeLike.js";
import { PiecesGroup } from "./rubixC/PiecesGroup.js";
import { smoothstep, remapPiToPI2 } from "./rubixC/math.js";

export function renderRubixCRoute(container) {
  container.innerHTML = `
    <p class="hero-label">Three.js + SuperNeatLib</p>
    <h1 class="hero-title">
  mmpg8889 g875a nnnf87  m987 bbek987 pppwed bbb224 5588 bb2 999654b ew 222
    </h1>
    <p class="hero-subtitle">A simple cube scene with orbit controls.</p>
    <div class="three-demo-canvas-wrap" id="rubixc-canvas-wrap" aria-label="RubixC cube demo"></div>
  `;

  const canvasWrap = container.querySelector("#rubixc-canvas-wrap");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#e2e8f0");

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(-3, 2.5, -3.5);

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

  const axesHelper = new THREE.AxesHelper( 5 );
  scene.add( axesHelper );
   
 //  const i1 = new THREE.Group();
 //  //scene.add(i1);
 //  i1.position.y = 1;
 //  {
 //  let p1 = plane({scale:1,color:colors.w});
 // // i1.add(p1);
 //  let p2 = plane({scale:1,color:colors.o});
 // // i1.add(p2);
 //  p2.rotation.x = Math.PI * 0.5;
 //  p2.rotation.z = Math.PI * 0.5;
 //  p2.position.y = -0.5;
 //  p2.position.x = 0.5;
  
  
 //  }



  // const p_1 = new Piece({colors:[colors.w],debug:true});
  // scene.add(p_1);

  
  // const p_2 = new Piece({colors:[colors.w,colors.b]});
  // scene.add(p_2);
  // p_2.position.x += -1.5;
  
  
  // const p_3 = new Piece({colors:[colors.w,colors.b,colors.o]});
  // scene.add(p_3);
  // p_3.position.x += -3.5;

  
  const gui = new GUI();
gui.add( document, 'title' );

    
    const guiobj = {
      x: 0,
      y: 0,
      z: 0,
      px: 0,
      py: 0,
      pz: 0
    }
    gui.add(guiobj, "x", -Math.PI*2, Math.PI*2).onChange(v=>{
      window.spindebug.rotation.x = v;
    });
gui.add(guiobj, "y", -Math.PI*2, Math.PI*2).onChange(v=>{
      window.spindebug.rotation.y = v;
    });
gui.add(guiobj, "z", -Math.PI*2, Math.PI*2).onChange(v=>{
      window.spindebug.rotation.z = v;
    });
  
gui.add(guiobj, "px", -1, 1).onChange(v=>{
      window.posdebug.position.x = v;
    });
  
gui.add(guiobj, "py", -1, 1).onChange(v=>{
      window.posdebug.position.y = v;
    });
gui.add(guiobj, "pz", -1, 1).onChange(v=>{
      window.posdebug.position.z = v;
    });

  
  const magicCube = new RubixCubeLike();

function detachAll(){
magicCube.pieces.forEach(x=>{
  magicCube.attach(x);
})
}
  
  scene.add(magicCube);
gui.hide();
  onConsole("???");
  // magicCube.pieces.forEach(x=>{
  //   x.highlight({amp:0.4});
  // });

 magicCube.tGS.top.forEach(x=>{
    // x.highlight({amp:0.4});
  });

  
/*
const groups = [
  "top",
  "bottom",
  "left",
  "right",
  "back",
  "front",
  "ringHorizontal",
  "ringVertical",
  "ringBow"
];

groups.forEach((g, i) => {
  setTimeout(() => {

    // revert everything first
    magicCube.pieces.forEach(x => {
      x.revertColor();
    });

    // highlight next group
    magicCube.tGS[g].forEach(x => {
      x.highlight({ amp: 0.4 });
    });

  }, i * 2000);
});

  */
  

  // setTimeout(x=>{
  //   magicCube.pieces.forEach(x=>{
  //     x.revertColor();
  //   });
  // },2000);

 // const PiecesGroup1 = new PiecesGroup();
  
  //magicCube.pieces.forEach((x)=>{
//    if(x.position.y > 0){
//      PiecesGroup1.add(x);
//    }
//  });

  
  setTimeout(x=>{
   let selected = magicCube.tGS.top;
    selected.forEach(x=>{
      x.highlight({amp:0.2});
      if(x.whichType !== "center" && selected.center){
        // well, it might jitter, but the rubix cube also has no center parent
        // so whatever like
        //selected.center.attach(x);
        
      }
    });
    // spinGroup();
   StartSpin({selected: magicCube.tGS.top});
  },2000);
  
  

  let spinGroupID;
  // let angle = -1;
  // let durration = 2000;
  // function spinGroup() {
  //   spinGroupID = requestAnimationFrame(spinGroup);
  //   if(PiecesGroup1.center){
      
  //     PiecesGroup1.center.rotation.y += 0.01;
  //     angle -= Math.sin();
  //   }
    
  //   if(angle <= 0){
  //     cancelAnimationFrame(spinGroupID);
  //   }
    
  // }

function StartSpin({selected,direction="counter"}={}){
     // let selected = magicCube.tGS.top;
  detachAll();
  magicCube.updateMatrixWorld(true);
  magicCube.refishGroups();
  
  const target = selected.center;
  const startQuaternion = target.quaternion.clone();

  

  
  // 2. Compute target quaternion by adding PI/2 to Y rotation
  const startEuler = new THREE.Euler().setFromQuaternion(startQuaternion);
  const yy = remapPiToPI2(startEuler.y);
  
  const delta = Math.PI / 2 * (direction === "counter" ? 1 : -1);
 const startY = target.rotation.y;
  const endY = startY + delta;
  
  const targetEuler = new THREE.Euler(startEuler.x, yy + delta, startEuler.z);
  
  // const targetEuler = new THREE.Euler(startEuler.x, startEuler.y + Math.PI / 2, startEuler.z);
  const targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);

  
  
  const duration = 1000;
  let startTime = null;
  

  
  function spinGroup(time) {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      let t = elapsed / duration;
      console.log("t",t);
      if (t >= 1) {
          // Snap exactly at the end
          // target.quaternion.copy(targetQuaternion);
        target.rotation.y = endY;
        
          setTimeout(x=>{
            //StartSpin({direction:"counter"});
               StartSpin({direction:"counter", selected: magicCube.tGS.top});
            
          },1000);
          return; // stop animation
      }
  
      // Apply easing
      const easedT = smoothstep(t);

      // Interpolate rotation
      // THREE.Quaternion.slerp(startQuaternion, targetQuaternion, target.quaternion, easedT);
          // target.quaternion.slerp(targetQuaternion, easedT);

    
        target.rotation.y = startY + (endY - startY) * easedT;


  
      requestAnimationFrame(spinGroup);
  }

  // start
requestAnimationFrame(spinGroup);
    
}

  
  
  
  const grid = new THREE.GridHelper(10, 10, 0x94a3b8, 0xcbd5e1);
  //grid.position.y = -1.1;
  //scene.add(grid);

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
