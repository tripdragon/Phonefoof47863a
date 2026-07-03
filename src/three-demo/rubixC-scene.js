import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Primitives, onConsole } from "superneatlib";
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.21/+esm';
import { RubixCubeLike } from "./rubixC/RubixCubeLike.js";
import { PiecesGroup } from "./rubixC/PiecesGroup.js";
import { smoothstep, remapPiToPI2 } from "./rubixC/math.js";
import { FingersAPI } from "./rubixC/fingersAPI.js";

export function renderRubixCRoute(container) {

  const kjdfg = document.querySelector(".menu");
  kjdfg.style.display = "none";
  console.log("hidden menu");

  container.innerHTML = `
    <p class="hero-label">Three.js + SuperNeatLib</p>
    <h1 class="hero-title">
gugireh6932
      </h1>
    <p class="hero-subtitle">For every one face turn, you affect 4 others. But not its reflection side.</p>
    <p class="hero-subtitle">Corner pieces are in 3 groups. Center and edge pieces are in 2 groups. </p>
    <div class="three-demo-canvas-wrap rubixc-canvas-wrap" id="rubixc-canvas-wrap" aria-label="RubixC cube demo">
      <button class="rubixc-fullscreen-button" type="button" id="rubixc-fullscreen-button" aria-label="Make RubixC scene full screen" aria-pressed="false">Full screen</button>
    </div>
  `;

  const canvasWrap = container.querySelector("#rubixc-canvas-wrap");
  const fullscreenButton = container.querySelector("#rubixc-fullscreen-button");

  window.THREE = THREE;

  const scene = new THREE.Scene();
  window.scene = scene;
  scene.background = new THREE.Color("#e2e8f0");

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  // camera.position.set(-3, 2.5, -3.5);
  // camera.position.set(0, 2.5, 3.5);
  camera.position.set(3, 2.5, 4.5);

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
magicCube.rotation.y = Math.PI;
  
// let iim = 0;
// need a delta clock
// magicCube.onBeforeRender = function(renderer, scene, camera, geometry, material, group){
//   this.rotation.y += 0.2;
//   iim++;
// }

magicCube.showCenterNormals();

  window.magicCube = magicCube;
  
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

  // resizeRenderer();
  // animate();

  // return;
  
  
const groupsNames = [
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

const START_DELAY = 200;
const SPEED = 100;
const DURATION = 1000;
const IDLE_DELAY = 10;
const DELTA_SPEED = 0.02;





//
// Spin test 222
//

// this type simply move the rotation with a delta from the durtation
// does not do any snapping, so its gonna drift

// dur 
// angle PI / 2
// delta angle / dur
// would need to know the stopping remaining delta
// so instead would subtract speed from an angle and at < 0 its whatever remains


  const DURATION_2 = 4000;

  // this starts the spin animation
  setTimeout(x=>{
    return

   StartSpin_2({selected: magicCube.tGS.top});
   // StartSpin_3({selected: magicCube.tGS.top});
  },START_DELAY);
  

  // this method just subtracts PI / 2 for a quater spin
  function StartSpin_2(){
    // let gain = 0;
    magicCube.refishGroups();
    let MAX_Angle = Math.PI / 2;
    const speedDelta = MAX_Angle / DURATION_2;
    console.log("MAX_Angle", MAX_Angle)
    console.log("speedDelta", speedDelta)

    function spinGroup_2(time) {
      let m_angle = MAX_Angle;
      MAX_Angle -= speedDelta;
      let delta = MAX_Angle;
      console.log("delta", delta)
      if(delta < 0) {delta = m_angle;}

      if(delta === 0){
        // exits animation
        debugger
        return;
      }
      
      

      magicCube.spinGroup({name:"left", 
        // axis : new THREE.Vector3(0, 1, 0), 
        // pivot : new THREE.Vector3(0,0,0),
        // angle: 0.2

        // deltaAngle: delta // this acumulates
        deltaAngle: 0.1 // its fine with a constant

        // angle: easedT
      })

      requestAnimationFrame(spinGroup_2);
    }

    // start
    requestAnimationFrame(spinGroup_2);
      
  }


  // ?????
function StartSpin_3({selected,direction="counter"}={}){

  // replaced??
  magicCube.refishGroups();

// cube.refishGroups()
    
  
  // const duration = SPEED;
  // const duration = DURATION;
  const duration = Math.PI / 2 / DELTA_SPEED;
  let startTime = null;
  
  console.log("duration", duration)

  
  function spinGroup_2(time) {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      let t = elapsed / duration;
      console.log("t",t);
      if (t >= 1) {
          // Snap exactly at the end
          //target.quaternion.copy(targetQuaternion);

          
          setTimeout(x=>{

            // loops
            index++;
            if(index === groupsNames.length){
              index = 0;
            }

            StartSpin_2({direction:"counter", selected: magicCube.tGS[groupsNames[index]]});
            
          },IDLE_DELAY);

          return; // stop animation
      }
  
      // Apply easing
      const easedT = smoothstep(t);

      // Interpolate rotation
      // THREE.Quaternion.slerp(startQuaternion, targetQuaternion, target.quaternion, easedT);
      // target.quaternion.slerp(targetQuaternion, easedT);


      // cube.refishGroups()
magicCube.spinGroup({name:"top", 
  // axis : new THREE.Vector3(0, 1, 0), 
  // pivot : new THREE.Vector3(0,0,0),
  // angle: 0.2
  deltaAngle: DELTA_SPEED
  // angle: easedT
})


  
      requestAnimationFrame(spinGroup_2);
  }

  // start
  requestAnimationFrame(spinGroup_2);
    
}

 



  

// 
// Previous spin system
// 

  
/*


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



  // this starts the spin animation
  setTimeout(x=>{
    return
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

let index = 0;


  
function StartSpin({selected,direction="counter"}={}){
     // let selected = magicCube.tGS.top;
  magicCube.updateMatrixWorld(true);

  detachAll();
  magicCube.updateMatrixWorld(true);
  magicCube.refishGroups();

  magicCube.core.quaternion.identity();
    magicCube.core.updateMatrix();
    magicCube.core.updateMatrixWorld(true);
    //everything should be detached here already
    

selected.forEach(x=>{
      //x.highlight({amp:0.2});


  if(groupsNames[index] === "ringHorizontal"
         || groupsNames[index] === "ringVertical"
        || groupsNames[index] === "ringBow"
         ){
    magicCube.core.attach(x);
  }
  else {
if(x.whichType !== "center" && selected.center){
        // well, it might jitter, but the rubix cube also has no center parent
        // so whatever like
        selected.center.attach(x);
}
  }
    });


    
  let target = selected.center;
  if(groupsNames[index] === "ringHorizontal"
         || groupsNames[index] === "ringVertical"
        || groupsNames[index] === "ringBow"
         ){
    target = magicCube.core;
   // magicCube.core.rotation.identity()
    
  }
  
  const startQuaternion = target.quaternion.clone();

  

  
  // 2. Compute target quaternion by adding PI/2 to Y rotation
  const startEuler = new THREE.Euler().setFromQuaternion(startQuaternion);
  const yy = remapPiToPI2(startEuler.y);
  
  const delta = Math.PI / 2 * (direction === "counter" ? 1 : -1);
 const startY = target.rotation.y;
  const endY = startY + delta;

  const goY = startQuaternion.clone();
  const eQ = new THREE.Euler().setFromQuaternion(startQuaternion);
  eQ.y += Math.PI / 2;
  
  
  const targetEuler = new THREE.Euler(startEuler.x, yy + delta, startEuler.z);
  
  //const targetEuler = new THREE.Euler(startEuler.x, startEuler.y + Math.PI / 2, startEuler.z);
  //const targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);
  //const targetQuaternion = new THREE.Quaternion().setFromEuler(eQ);
  
  const startQ = startQuaternion.clone();

  const axisV = new THREE.Vector3(0,1,0);
if(groupsNames[index] === "ringBow"){
 axisV.set(0,0,1)
}
  else if(groupsNames[index] === "ringVertical"){
     axisV.set(1,0,0)
    
  }
  
// 90 degrees around Y axis
const deltaQ = new THREE.Quaternion().setFromAxisAngle(
 // new THREE.Vector3(0, 1, 0),
  axisV,
  Math.PI / 2
);

// apply relative rotation to the starting orientation
const targetQuaternion = startQ.clone().multiply(deltaQ);

  
  const duration = 524;
  let startTime = null;
  

  
  function spinGroup(time) {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      let t = elapsed / duration;
      console.log("t",t);
      if (t >= 1) {
          // Snap exactly at the end
          target.quaternion.copy(targetQuaternion);
      //  target.rotation.y = endY;
        
          setTimeout(x=>{
            index++;
            if(index === groupsNames.length){
              index = 0;
            }
              
            //StartSpin({direction:"counter"});
             //  StartSpin({direction:"counter", selected: magicCube.tGS.front});
                           StartSpin({direction:"counter", selected: magicCube.tGS[groupsNames[index]]});
            
          },1000);
          return; // stop animation
      }
  
      // Apply easing
      const easedT = smoothstep(t);

      // Interpolate rotation
      // THREE.Quaternion.slerp(startQuaternion, targetQuaternion, target.quaternion, easedT);
          target.quaternion.slerp(targetQuaternion, easedT);

    
        //target.rotation.y = startY + (endY - startY) * easedT;


  
      requestAnimationFrame(spinGroup);
  }

  // start
requestAnimationFrame(spinGroup);
    
}

  
  /*
  
  +++++++++++
  fingersAPI

  */
  

  const fingersAPI = new FingersAPI({
    camera,
    domElement: renderer.domElement,
    scene,
    controls,
    cube: magicCube
  });
  fingersAPI.beginPointerEvents();


  const grid = new THREE.GridHelper(10, 10, 0x94a3b8, 0xcbd5e1);
  //grid.position.y = -1.1;
  //scene.add(grid);

  let animationFrameId = null;
  let isFullscreenFallback = false;

  function isNativeFullscreen() {
    return document.fullscreenElement === canvasWrap || document.webkitFullscreenElement === canvasWrap;
  }

  function updateFullscreenButton() {
    const isFullscreen = isNativeFullscreen() || isFullscreenFallback;
    fullscreenButton.setAttribute("aria-pressed", String(isFullscreen));
    fullscreenButton.textContent = isFullscreen ? "Exit full screen" : "Full screen";
  }

  function resizeRenderer() {
    const width = canvasWrap.clientWidth || window.innerWidth;
    const height = canvasWrap.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function setFullscreenFallback(enabled) {
    isFullscreenFallback = enabled;
    canvasWrap.classList.toggle("is-rubixc-fullscreen", enabled);
    document.body.classList.toggle("rubixc-fullscreen-active", enabled);
    updateFullscreenButton();
    requestAnimationFrame(resizeRenderer);
  }

  async function enterFullscreen() {
    if (canvasWrap.requestFullscreen) {
      await canvasWrap.requestFullscreen();
    } else if (canvasWrap.webkitRequestFullscreen) {
      canvasWrap.webkitRequestFullscreen();
    } else {
      setFullscreenFallback(true);
    }
  }

  async function exitFullscreen() {
    if (isFullscreenFallback) {
      setFullscreenFallback(false);
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }

  async function toggleFullscreen() {
    try {
      if (isNativeFullscreen() || isFullscreenFallback) {
        await exitFullscreen();
      } else {
        await enterFullscreen();
      }
    } catch {
      setFullscreenFallback(!isFullscreenFallback);
    }

    updateFullscreenButton();
    requestAnimationFrame(resizeRenderer);
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

  const resizeObserver = new ResizeObserver(resizeRenderer);
  resizeObserver.observe(canvasWrap);
  fullscreenButton.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
  window.addEventListener("resize", resizeRenderer);
  window.visualViewport?.addEventListener("resize", resizeRenderer);

  return () => {
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
    }

    window.removeEventListener("resize", resizeRenderer);
    window.visualViewport?.removeEventListener("resize", resizeRenderer);
    document.removeEventListener("fullscreenchange", updateFullscreenButton);
    document.removeEventListener("webkitfullscreenchange", updateFullscreenButton);
    fullscreenButton.removeEventListener("click", toggleFullscreen);
    resizeObserver.disconnect();
    if (isFullscreenFallback) {
      setFullscreenFallback(false);
    }
    fingersAPI.dispose();
    controls.dispose();
    renderer.dispose();
    canvasWrap.innerHTML = "";
  };
}
