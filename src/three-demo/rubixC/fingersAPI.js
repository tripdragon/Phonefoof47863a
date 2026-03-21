import * as THREE from "three";
import { SlightlyPriceyPool } from './slightlyPriceyPool.js';
// A lot of this might should be from superneatlike pointer events

export class FingersAPI {

  planePool; // CheapPoolIsh
  planePoolGrid; // stupid names
  planePoolHolder3D;
  debuggersObject3D;
  planeHitsMax;
  hits1 = [];
  raycaster = new THREE.Raycaster();
  planeHelper;
  planeMath;

  screenCoordsV = new THREE.Vector2();
  selectedPiece = null;

  faceArrow;
  faceGridHelper;
  useFaceArrowDebugger = true;
  useFaceGridDebugger = true;
  arrowDirectionV = new THREE.Vector3();
  arrowOriginV = new THREE.Vector3();

  IS_DOWN = false;

  // reuseables
  normalMatrix = new THREE.Matrix3();
  worldNormal = new THREE.Vector3();
  box1 = new THREE.Box3();
  centerV = new THREE.Vector3();
  sizeV = new THREE.Vector3();

  constructor({ camera, domElement, scene, controls, cube, planeHitsMax = 42 } = {}) {

    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.controls = controls;
    this.cube = cube;
    this.planeHitsMax = planeHitsMax;
    // this.planeHitsMax = 4;

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    
    this.buildPlanePool();
    this.buildVisualHelpers();

  }
  beginPointerEvents() {
    if (!this.domElement) return;
    this.domElement.style.touchAction = "none";
    this.domElement.addEventListener("pointerdown", this.onPointerDown);
    this.domElement.addEventListener("pointermove", this.onPointerMove);
    this.domElement.addEventListener("pointerup", this.onPointerUp);
    this.domElement.addEventListener("pointercancel", this.onPointerUp);
    this.domElement.addEventListener("pointerleave", this.onPointerUp);
  }

  onPointerDown(ev){
    // this.IS_DOWN = true;
    // this.controls.enabled = false;
    this.trySelectingPiece(ev);
  }
  onPointerMove(ev){
    if (!this.IS_DOWN) return;
    this.trySelectingPiece(ev);
  }
  onPointerUp(ev){
    // if (this.hits1.length > 0) {
    // }
    this.controls.enabled = true;
    this.IS_DOWN = false;
    this.selectedPiece = null;
  }

  buildPlanePool(){

    if (!this.scene) return;
    this.planePoolHolder3D = new THREE.Group();
    this.scene.add(this.planePoolHolder3D);
    this.planePool  = new SlightlyPriceyPool({rootObject3D:this.planePoolHolder3D});
    this.planePoolGrid  = new SlightlyPriceyPool({rootObject3D:this.planePoolHolder3D});
    
    const markerGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xffff22 });
    const markerMat2 = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
    
    for (let i = 0; i < this.planeHitsMax; i++) {
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.visible = false;
      this.planePool.add(marker);
      this.planePoolHolder3D.add(marker);
      // other type for the face grid
      const markerB = new THREE.Mesh(markerGeo, markerMat2);
      markerB.visible = false;
      this.planePoolGrid.add(markerB);
      this.planePoolHolder3D.add(markerB);
    }

  }
  
  buildVisualHelpers(){
    // this.arrowOut = new THREE.ArrowHelper(this.arrowDirection, this.arrowOrigin, 0.01, 0x111111, 0.15, 0.08);
    // this.arrowOut.visible = false;
    // this.planePoolHolder3D.add(this.arrowOut);

    this.debuggersObject3D = new THREE.Group();
    this.scene.add(this.debuggersObject3D);

    this.faceArrow = new THREE.ArrowHelper(this.arrowDirectionV, this.arrowOriginV, 1.1, 0x2d7fff, 0.18, 0.1);
    this.faceArrow.visible = false;
    this.debuggersObject3D.add(this.faceArrow);

    this.faceGridHelper = new THREE.GridHelper(3, 12, 0x2d7fff, 0x2d7fff);
    this.faceGridHelper.visible = false;
    this.debuggersObject3D.add(this.faceGridHelper);

    this.planeMath = new THREE.Plane( new THREE.Vector3( 1, 1, 0 ), 4 );
    this.planeHelper = new THREE.PlaneHelper( this.planeMath, 4, 0xafff00 );
    this.debuggersObject3D.add( this.planeHelper );
    
  }


  
  trySelectingPiece(ev){
    // if (!this.IS_DOWN) return;
    if (!this.camera || !this.cube || !this.domElement) return null;
    const v1 = this.getScreenCoords(ev);
    this.raycaster.setFromCamera(v1, this.camera);

    const zones = this.cube.pieces.flatMap(piece => piece.hitZone);

    this.hits1 = this.raycaster.intersectObjects(zones, false);
    console.log(this.hits1);
    
    const ball = this.planePool.requestItem();
    const ballGrid = this.planePoolGrid.requestItem();
    if(this.hits1.length > 0){
      this.IS_DOWN = true;
      this.controls.enabled = false;
      
      ball.visible = true;
      ball.position.copy(this.hits1[0].point);


      if(this.useFaceArrowDebugger){
        this.displayFaceArrow(this.hits1[0]);
      }
      if(this.useFaceGridDebugger){
        this.displayFaceGrid(this.hits1[0]);
      }
      
      ballGrid.visible = true;
      // ballGrid.position.copy(this.hits1[0].point).add(new THREE.Vector3(0.1,0.1,0.1));
      ballGrid.position.copy(this.hits1[0].point);
      this.selectPiece();


    }

  }

  runBallOnCube(){

  }

  // moves the faceArrow into the face of the selected hitzone
  displayFaceArrow(hit){
    this.faceArrow.visible = true;
    this.faceArrow.position.copy(hit.point);
    // this.faceArrow.setDirection(hit.normal)

    // --- get world normal ---
    this.normalMatrix.getNormalMatrix(hit.object.matrixWorld);
    this.worldNormal.copy(hit.face.normal).applyMatrix3(this.normalMatrix).normalize();

    this.box1.setFromObject(hit.object);
    this.box1.getCenter(this.centerV);
    // project onto face using normal
    this.centerV.addScaledVector(this.worldNormal, this.box1.getSize(this.sizeV).length() / 6);

    // --- position arrow at hit point ---
    // this.faceArrow.position.copy(hit.point);
    this.faceArrow.position.copy(this.centerV);
    // --- orient arrow ---
    this.faceArrow.setDirection(this.worldNormal);
    
  }

  upV = new THREE.Vector3(0,1,0);
  displayFaceGrid(hit){
    // also update
    this.faceGridHelper.position.copy(hit.point);
        // --- get world normal ---
    this.normalMatrix.getNormalMatrix(hit.object.matrixWorld);
    this.worldNormal.copy(hit.face.normal).applyMatrix3(this.normalMatrix).normalize();

    // this.faceGridHelper.quaternion.setFromUnitVectors(this.upV, hit.normal);
    this.faceGridHelper.quaternion.setFromUnitVectors(this.upV, this.worldNormal);
    this.faceGridHelper.visible = true;

    // alternative using infinite math plane and its helper
    this.planeMath.set(this.worldNormal,0)
  }

  selectPiece(){
    if(this.selectedPiece === null){
      this.selectedPiece = this.hits1[0].object;
      // console.log(this.selectedPiece);
      
      this.cube.pieces.forEach(x=>{
        x.revertColor();
      })

      if(this.selectedPiece.parent?.isPiece){
        this.selectedPiece.parent.highlight();
      }
    }
  }

// utilites

  getScreenCoords(ev){
    const rect = this.domElement.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    return this.screenCoordsV.set(x, y);
  }

}

