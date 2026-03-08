import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Primitives, CheapPool } from "superneatlib";

export function renderRubixCRoute(container) {
// CheapPool
  container.innerHTML = `
    <p class="hero-label">Three.js + SuperNeatLib</p>
    <h1 class="hero-title">55384bbb5a 4444aa 2222bbba </h1>
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
    w:0xffeeee,
    r:0xff0000,
    g:0x00ff00,
    b:0x0000ff,
    o:0xffbb00,
    y:0x00ffff
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
  constructor({ colors = [],
               borderColor=0x000000,
               borderWidth=0.04,
               debug=false
              } = {}) {
    super();
    this.colors = [...colors];
    this.borderColor = borderColor;
    this.borderWidth = borderWidth;
    this.debug=debug;
    this.debug=true;
    this.build();
    if(this.debug){
      this.buildDebug();
    }
  }
  build(){
    if(this.colors.length > 0){
      // let p1 = plane({scale:1,color:this.colors[0]});
      let p1 = this.makePlane(this.colors[0]);
      p1.rotation.x = Math.PI * -0.5;
      p1.position.y = 1;
      this.add(p1);
      
      if(this.colors.length > 1){
        p1.position.z = -0.5;
        //let p3 = plane({scale:1,color:this.colors[1]});
        let pf = this.makePlane(this.colors[1]);
        this.add(pf);
        pf.position.y = 0.5;
        pf.position.z = -1;
        
        pf.rotation.y = Math.PI * 1.0;
        pf.rotation.z = Math.PI * 0.5;
        
        if(this.colors.length > 2){
          p1.position.x = -0.5;
          pf.position.x = -0.5;
          let ps = this.makePlane(this.colors[2]);
          this.add(ps);
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
  }


  // const p_1 = new Piece({colors:[colors.w],debug:true});
  // scene.add(p_1);

  
  // const p_2 = new Piece({colors:[colors.w,colors.b]});
  // scene.add(p_2);
  // p_2.position.x += -1.5;
  
  
  // const p_3 = new Piece({colors:[colors.w,colors.b,colors.o]});
  // scene.add(p_3);
  // p_3.position.x += -3.5;

  class LevelPieces extends CheapPool {
    constructor(){
      super();
    }
  }
  const topLevel = new LevelPieces();
  const magicCube = new THREE.Group();
  scene.add(magicCube);
  
  // routine for blocks of pieces
  // starting from center, down, bottom right going in a counterclockwise circle
  // top
  function buildTopLevel(){
    const p0 = new Piece({colors:[colors.w],debug:true});
    magicCube.add(p0);
    
    const p1 = new Piece({colors:[colors.w,colors.b]});
    magicCube.add(p1);
    p1.position.z = -0.5;
    
    const p2 = new Piece({colors:[colors.w,colors.b,colors.o]});
    magicCube.add(p2);
    p2.position.z = -0.5;
    p2.position.x = -0.5;

  }

  buildTopLevel();
  






  
  
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
