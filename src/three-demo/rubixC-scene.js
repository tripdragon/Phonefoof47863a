import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Primitives, CheapPool, colors as SColors, onConsole } from "superneatlib";
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.21/+esm';

export function renderRubixCRoute(container) {
  container.innerHTML = `
    <p class="hero-label">Three.js + SuperNeatLib</p>
    <h1 class="hero-title">
    8bb 777bbb 444bbbba 374 122121212bbb 10101012 99jhdf 888jbasf 77b 555a 44 3333 2222
    </h1>
    <p class="hero-subtitle">A simple cube scene with orbit controls.</p>
    <div class="three-demo-canvas-wrap" id="rubixc-canvas-wrap" aria-label="RubixC cube demo"></div>
  `;
const plane = Primitives.plane;
  
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
  
  const colors = {
    w:0xffeffe,
    r:0xff0000,
    g:0x00bb00,
    b:0x0000ff,
    o:0xffbb00,
    y:0xffff00
  };
   
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

class Piece extends THREE.Object3D {
  isPiece = true;
  borderMat = null;
  borderWidth;
  borderColor=0xffaacc;
  debug;
  planes=[];// tuple {plane,color}
  colors=[];
  constructor({ colors = [],
               borderColor=0x000000,
               borderWidth=0.02546,
               debug=false
              } = {}) {
    super();
    this.colors = [...colors];
    this.borderColor = borderColor;
    this.borderWidth = borderWidth;
    this.debug=debug;
    this.debug=false;
    this.build();
    if(this.debug){
      this.buildDebug();
    }
  }
  storePlane(plane,color){
    this.planes.push({plane,color:color});
  }
  build(){
    if(this.colors.length > 0){
      // let p1 = plane({scale:1,color:this.colors[0]});
      let p1 = this.makePlane(this.colors[0]);
      p1.rotation.x = Math.PI * -0.5;
      p1.position.y = 1;
      this.add(p1);
      this.storePlane(p1,this.colors[0]);
      
      if(this.colors.length > 1){
        p1.position.z = -0.5;
        //let p3 = plane({scale:1,color:this.colors[1]});
        let pf = this.makePlane(this.colors[1]);
        this.add(pf);
        this.storePlane(pf,this.colors[1]);
      
        pf.position.y = 0.5;
        pf.position.z = -1;
        
        pf.rotation.y = Math.PI * 1.0;
        pf.rotation.z = Math.PI * 0.5;
        
        if(this.colors.length > 2){
          p1.position.x = -0.5;
          pf.position.x = -0.5;
          let ps = this.makePlane(this.colors[2]);
          this.add(ps);
          this.storePlane(ps,this.colors[2]);
    
          ps.position.z = -0.5;
          ps.rotation.y = Math.PI * -0.5;
          ps.position.y = 0.5;
          ps.position.x = -1;
        }
      }

    }
  }// build

  buildDebug(){
    const geometry = new THREE.SphereGeometry( 0.2, 8, 8 );
    const material = new THREE.MeshBasicMaterial( { color: 0x8822ff } );
    const sphere = new THREE.Mesh( geometry, material );
    this.add( sphere );
  }//buildDebug

  makePlane(color=0xeeaa22){
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uMainColor: { value: new THREE.Color(color) },
        uBorderColor: { value: new THREE.Color(this.borderColor) },
        uBorderWidth: { value: this.borderWidth } // 0.0 -> 0.5
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uMainColor;
        uniform vec3 uBorderColor;
        uniform float uBorderWidth;

        varying vec2 vUv;

        void main() {
          float d = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
          float borderMask = step(d, uBorderWidth);

          vec3 color = mix(uMainColor, uBorderColor, borderMask);
          gl_FragColor = vec4(color, 1.0);
        }
        `
      });

      const geometry = new THREE.PlaneGeometry(1.0, 1.0);
      const plane = new THREE.Mesh(geometry, mat);
      return plane;
    }//makePlane
    // ai had to fix
    highlight({ duration = 1, amp = 0.2 }) {
      this.planes.forEach((p) => {
        onConsole.log("c",p.color);
        //const { h, s, l } = SColors.hexToHsl(p.color);
       // p.plane?.material?.color?.setHSL(h, s, Math.min(l + amp, 1));
      });
    }
  }// Piece class


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

  
  class LevelPieces extends CheapPool {
    constructor(){
      super();
    }
  }
  const topLevel = new LevelPieces();

  class RubixCubeLike extends THREE.Group{
    pieces=[];
    constructor(){
      super();
      this.buildTopLevel();
      this.buildCenterLevel();
      this.buildBottomLevel();
    }
    // routine for blocks of pieces
    // starting from center, down, bottom right going in a counterclockwise circle
    // top
    buildTopLevel(){
      const p0 = new Piece({colors:[colors.w],debug:true});
      this.add(p0); this.pieces.push(p0);
      p0.position.y = 0.5;
      
      const p1 = new Piece({colors:[colors.w,colors.b]});
      this.add(p1);this.pieces.push(p1);
      p1.position.z = -0.5;
      p1.position.y = 0.5;
      
      const p2 = new Piece({colors:[colors.w,colors.b,colors.o]});
      this.add(p2);this.pieces.push(p2);
      p2.position.z = -0.5;
      p2.position.x = -0.5;
      p2.position.y = 0.5;
      //
      const p3 = new Piece({colors:[colors.w,colors.o]});
      this.add(p3);this.pieces.push(p3);
      p3.position.x = -0.5;
      p3.rotation.y = Math.PI * 0.5;
      p3.position.y = 0.5;
      
      const p4 = new Piece({colors:[colors.w,colors.o,colors.g]});
      this.add(p4);this.pieces.push(p4);
      p4.position.z = 0.5;
      p4.position.x = -0.5;
      p4.rotation.y = Math.PI * 0.5;
      p4.position.y = 0.5;
      //
      const p5 = new Piece({colors:[colors.w,colors.g]});
      this.add(p5);this.pieces.push(p5);
      p5.position.z = 0.5;
      p5.rotation.y = Math.PI;
      p5.position.y = 0.5;
      
      const p6 = new Piece({colors:[colors.w,colors.g,colors.r]});
      this.add(p6);this.pieces.push(p6);
      p6.position.z = 0.5;
      p6.position.x = 0.5;
      p6.rotation.y = Math.PI;
      p6.position.y = 0.5;
      //
      const p7 = new Piece({colors:[colors.w,colors.r]});
      this.add(p7);this.pieces.push(p7);
      p7.position.x = 0.5;
      p7.rotation.y = Math.PI * 2.0 * 0.75;
      p7.position.y = 0.5;
      const p8 = new Piece({colors:[colors.w,colors.r,colors.b]});
      this.add(p8);this.pieces.push(p8);
      p8.position.z = -0.5;
      p8.position.x = 0.5;
      p8.rotation.y = Math.PI * 2.0 * 0.75;
      p8.position.y = 0.5;
    }

    buildCenterLevel(){
      // goes counterclockwise from front
      const p1 = new Piece({colors:[colors.b],debug:true});
      this.add(p1);this.pieces.push(p1);
      p1.rotation.x = Math.PI *-0.5;
      p1.position.z = -0.5;
      //
      const p2 = new Piece({colors:[colors.b,colors.o],debug:true});
      this.add(p2);this.pieces.push(p2);
      // rotations derived from testing on lilgui
      p2.rotation.x = -Math.PI;
      p2.rotation.y = Math.PI * 0.5;
      p2.rotation.z = Math.PI * 0.5;
      p2.position.x = -0.5;
      p2.position.z = -0.5;
      //
      const p3 = new Piece({colors:[colors.o],debug:true});
      this.add(p3);this.pieces.push(p3);
      p3.rotation.z = -Math.PI * 2 * 0.75;
      p3.position.x = -0.5;
      // window.posdebug = p3;
      //
      const p4 = new Piece({colors:[colors.o,colors.g],debug:true});
      this.add(p4);this.pieces.push(p4);
      // rotations derived from testing on lilgui
      p4.rotation.x = -Math.PI;
      p4.rotation.y = 0;
      p4.rotation.z = Math.PI * 0.5;
      p4.position.x = -0.5;
      p4.position.z = 0.5;
      //
      // window.spindebug = p4;
      
      const p5 = new Piece({colors:[colors.g],debug:true});
      this.add(p5);this.pieces.push(p5);
      p5.rotation.x = -Math.PI * 2 * 0.75;
      p5.position.z = 0.5;
      // window.spindebug = p5;
      // window.posdebug = p5;
      // 
      const p6 = new Piece({colors:[colors.g,colors.r],debug:true});
      this.add(p6);this.pieces.push(p6);
      p6.rotation.x = Math.PI;
      p6.rotation.y = Math.PI * 2 * 0.75;
      p6.rotation.z = Math.PI * 0.5;
      p6.position.x = 0.5;
      p6.position.y = 0;
      p6.position.z = 0.5;
      //
      // window.spindebug = p6;
      // window.posdebug = p6;
  
      const p7 = new Piece({colors:[colors.r],debug:true});
      this.add(p7);this.pieces.push(p7);
      p7.rotation.z = Math.PI * 2 * 0.75;
      p7.position.x = 0.5;
      window.spindebug = p7;
      window.posdebug = p7;
      // 
      const p8 = new Piece({colors:[colors.r,colors.b],debug:true});
      this.add(p8);this.pieces.push(p8);
      p8.rotation.x = -Math.PI;
      p8.rotation.y = Math.PI;
      p8.rotation.z = Math.PI * 0.5;
      p8.position.x = 0.5;
      p8.position.y = 0;
      p8.position.z = -0.5;
      //
      // window.spindebug = p8;
      // window.posdebug = p8;
    }// buildTopLevel
    
    buildBottomLevel(){
      const p0 = new Piece({colors:[colors.y],debug:true});
      this.add(p0);this.pieces.push(p0);
      p0.position.y = -0.5;
      p0.rotation.z = Math.PI;
      window.spindebug = p0;
      
      const p1 = new Piece({colors:[colors.y,colors.b]});
      this.add(p1);this.pieces.push(p1);
      p1.position.z = -0.5;
      p1.position.y = -0.5;
      p1.rotation.z = Math.PI;
      
      
      const p2 = new Piece({colors:[colors.y,colors.o,colors.b]});
      this.add(p2);this.pieces.push(p2);
      p2.position.z = -0.5;
      p2.position.x = -0.5;
      p2.position.y = -0.5;
      p2.rotation.x = Math.PI * 0.5;
      p2.rotation.y = Math.PI * 0.5;
      p2.rotation.z = Math.PI * 0.5;
      // window.spindebug=p2;
      // window.posdebug = p2;
      //
      const p3 = new Piece({colors:[colors.y,colors.o]});
      this.add(p3);this.pieces.push(p3);
      p3.position.x = -0.5;
      p3.rotation.y = Math.PI * 0.5;
      p3.rotation.z = -Math.PI;
      p3.position.y = -0.5;
  
      const p4 = new Piece({colors:[colors.y,colors.g,colors.o]});
      this.add(p4);this.pieces.push(p4);
      p4.position.z = 0.5;
      p4.position.x = -0.5;
      p4.position.y = -0.5;
      p4.rotation.x = 0;
      p4.rotation.y = -Math.PI;
      p4.rotation.z = Math.PI;
      
      //
      const p5 = new Piece({colors:[colors.y,colors.g]});
      this.add(p5);this.pieces.push(p5);
      p5.position.z = 0.5;
      p5.position.y = -0.5;
      p5.rotation.x = 0;
      p5.rotation.y = Math.PI;
      p5.rotation.z = Math.PI;
  
      
      
      const p6 = new Piece({colors:[colors.y,colors.r,colors.g]});
      this.add(p6);this.pieces.push(p6);
      p6.position.x = 0.5;
      p6.position.y = -0.5;
      p6.position.z = 0.5;
      p6.rotation.x = Math.PI;
      p6.rotation.y = Math.PI * 2 * 0.75;
      p6.rotation.z = 0;
  
      //
      const p7 = new Piece({colors:[colors.y,colors.r]});
      this.add(p7);this.pieces.push(p7);
      p7.position.x = 0.5;
      p7.position.y = -0.5;
      p7.rotation.x = 0;
      p7.rotation.y = -Math.PI * 0.5;
      p7.rotation.z = Math.PI;
  
      
      const p8 = new Piece({colors:[colors.y,colors.b,colors.r]});
      this.add(p8);this.pieces.push(p8);
      p8.position.x = 0.5;
      p8.position.y = -0.5;
      p8.position.z = -0.5;
      p8.rotation.x = 0;
      p8.rotation.y = 0;
      p8.rotation.z = Math.PI;
      
  
      
      window.spindebug=p8;
      window.posdebug = p8;
      
      return
      
    }// buildBottomLevel

  }// RubixCubeLike


  const magicCube = new RubixCubeLike();
  scene.add(magicCube);

  magicCube.pieces.forEach(x=>{
    x.highlight({amp:0.4});
  });
  
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
