import * as THREE from "three";
import { SlightlyPriceyPool } from './slightlyPriceyPool.js';
import { _setMinAndMaxByKey } from "chart.js/helpers";
// A lot of this might should be from superneatlike pointer events

    // on pointer down first test if on the cube
    // + test if on a piece
    // + get the face of the piece and its normal
    // + draw a giant 3d plane on the face
    // + continue hit tests now onto this plane
    // + over time test the form of points gesture
    //   ++ are they going in a direction n w s e
    //   ++ or in a radial circular
    // + convert the points to local space onto the face
    // + once gesture is picked get the delta distance
    // + locate which side of cube is effected
    // + begin its rotating using the delta
    // + delegate further work to different api to follow finger
  
const states = {
  idle : "idle",
  onCube : "onCube",
  seeking : "seeking",
  found : "found",
  following : "following",
  rolling : "rolling"
}


export class FingersAPI {
  
  state = states.idle;
  isOnCube = false;

  activePointers = new Map();
  
  planePool; // CheapPoolIsh
  planePoolGrid; // stupid names
  planePoolHolder3D;
  planeHitZone3D;
  debuggersObject3D;
  planeHitsMax;
  hits1 = [];// for raycaster
  hitsPlane = [];// for racaster
  raycaster = new THREE.Raycaster();
  pointsPlane = []; // as finger moves
  planeHelper;
  hitDown = null; // is a hit object with .point for position
  pointDown3D = new THREE.Vector3(); // world position
  // the math does not line up on 3d without 
  // even more math to get the proper constant 
  // planeMath;
  arrowDirHelper;
  arrowDirV = new THREE.Vector3();
  arrowDirOriginV = new THREE.Vector3();

  screenCoordsV = new THREE.Vector2();
  selectedPiece = null;

  faceArrow;
  faceGridHelper;
  useFaceArrowDebugger = true;
  useFaceGridDebugger = true;
  lockGridDown = false;
  arrowDirectionV = new THREE.Vector3();
  arrowOriginV = new THREE.Vector3();
  movingAveragePointV = new THREE.Vector3();
  currentDragDistance = 0;
  lastTriggeredDistance = 0;
  triggerDistance = 0.35;
  distanceHudEl = null;
  thresholdBubbleTimeout = null;

  showDirectionArrow = true;
  showPlaneBallDebugger = true;

  //movingAvV = new THREE.Vector3();

  IS_DOWN = false;

  // reuseables
  normalMatrix = new THREE.Matrix3();
  worldNormal = new THREE.Vector3();
  box1 = new THREE.Box3();
  centerV = new THREE.Vector3();
  sizeV = new THREE.Vector3();

  constructor({ camera, domElement, scene, controls, cube, planeHitsMax = 42, triggerDistance = 0.35 } = {}) {

    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.controls = controls;
    this.cube = cube;
    this.planeHitsMax = planeHitsMax;
    this.triggerDistance = triggerDistance;
    // this.planeHitsMax = 4;

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    
    this.buildPlanePool();
    this.buildVisualHelpers();
    this.buildDistanceHud();

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
    this.IS_DOWN = true;
    // this.controls.enabled = false;
    this.activePointers.set(ev.pointerId, ev);
    this.pointsPlane.length = 0;
    this.currentDragDistance = 0;
    this.lastTriggeredDistance = 0;
    this.updateDistanceHud(0);
    // this.trySelectingPiece(ev);
    this.tryPointerDown(ev);
  }
  onPointerMove(ev){
    // if (!this.IS_DOWN) return;
    if (!this.isOnCube) return;
    // if (this.state === states.idle) return;
    
    // this.trySelectingPiece(ev);
    this.seeking(ev);
  }
  
  onPointerUp(ev){
    this.state = states.idle; // ??
    this.isOnCube = false;

    // if (this.hits1.length > 0) {
    // }
    this.activePointers.delete(ev.pointerId);
    this.controls.enabled = true;
    this.IS_DOWN = false;
    this.selectedPiece = null;
    this.lockGridDown = false;
    this.lastTriggeredDistance = 0;
    this.updateDistanceHud(0);
  }

  buildPlanePool(){

    if (!this.scene) return;
    this.planePoolHolder3D = new THREE.Group();
    this.scene.add(this.planePoolHolder3D);
    this.planePool  = new SlightlyPriceyPool({rootObject3D:this.planePoolHolder3D});
    this.planePoolGrid  = new SlightlyPriceyPool({rootObject3D:this.planePoolHolder3D});

    // need the plane facing up for other calculations later
    const geometry = new THREE.PlaneGeometry( 10, 10 );
    const matrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    geometry.applyMatrix4(matrix);


      
    const material = new THREE.MeshBasicMaterial( { color: 0xff22ff, opacity:0.2, transparent : true} );
    const plane = new THREE.Mesh( geometry, material );
    scene.add( plane );
    this.planeHitZone3D = plane;
    //plane.visible = false;
    
    const axesHelper = new THREE.AxesHelper( 5 );
    plane.add( axesHelper );
    
    
    const markerGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xffff22 });
    const markerMat2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    
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
    this.planeHitZone3D.add(this.faceGridHelper);

    //this.planeMath = new THREE.Plane( new THREE.Vector3( 1, 1, 0 ), 4 );
    //this.planeHelper = new THREE.PlaneHelper( this.planeMath, 4, 0xafff00 );
    //this.debuggersObject3D.add( this.planeHelper );

    
    this.arrowDirHelper = new THREE.ArrowHelper(this.arrowDirV, this.arrowDirOriginV, 5.1, 0xffffff, 0.18, 0.1);
    //this.arrowDirHelper.visible = false;
    this.debuggersObject3D.add(this.arrowDirHelper);

  }

  buildDistanceHud() {
    if (typeof document === "undefined") return;
    const hud = document.createElement("output");
    hud.className = "superneat-top-log";
    hud.setAttribute("aria-live", "polite");
    hud.textContent = "Drag distance: 0.000";
    document.body.appendChild(hud);
    this.distanceHudEl = hud;
  }

  updateDistanceHud(distance) {
    if (!this.distanceHudEl) return;
    this.distanceHudEl.textContent = `Drag distance: ${distance.toFixed(3)}`;
  }

  popThresholdBubble(distance) {
    if (typeof document === "undefined") return;
    const bubble = document.createElement("output");
    bubble.className = "superneat-top-log";
    bubble.style.top = "2.8rem";
    bubble.style.background = "rgba(22, 101, 52, 0.94)";
    bubble.style.borderColor = "#14532d";
    bubble.textContent = `Distance reached ${distance.toFixed(3)} (threshold ${this.triggerDistance.toFixed(3)})`;
    document.body.appendChild(bubble);

    if (this.thresholdBubbleTimeout) {
      window.clearTimeout(this.thresholdBubbleTimeout);
    }
    this.thresholdBubbleTimeout = window.setTimeout(() => {
      bubble.remove();
      if (this.thresholdBubbleTimeout) {
        this.thresholdBubbleTimeout = null;
      }
    }, 1600);
  }


  getHits(ev){
    // updates the raycaster onto the pieces hitzones
    // into this.hits1 array
    // and returns the hits
    const v1 = this.getScreenCoords(ev);
    this.raycaster.setFromCamera(v1, this.camera);

    const zones = this.cube.pieces.flatMap(piece => piece.hitZone);

    this.hits1 = this.raycaster.intersectObjects(zones, false);
    console.log("hits", this.hits1);
    // return this.hits1;
  }


  tryPointerDown(ev){
    
    this.getHits(ev);

    const ball = this.planePool.requestItem();

    if(this.hits1.length > 0){

      // figuring out the nessesary flag states
      //this.IS_DOWN = true;
      this.state = states.onCube;
      // this.state = this.state.seeking;
      this.isOnCube = true;

      this.hitDown = this.hits1[0];
      this.pointDown3D.copy(this.hitDown.point);
      
      this.controls.enabled = false;
      
      ball.visible = true;
      ball.position.copy(this.pointDown3D);
      
      this.selectPiece(this.hitDown);

      this.highlightSelected();

      this.highlightGroupsInSelected();

      this.refreshPieceFaceNormal(this.hitDown);

      this.refreshFacePlane(ev);

      this.refreshDirectionArrow(ev);

    }

  }

  selectPiece(hit){
    if(hit.object.parent?.isPiece){
      this.selectedPiece = hit.object.parent;
    }
    // console.log(this.selectedPiece);
  }

  highlightSelected(){
    this.cube.pieces.forEach(x=>{
      x.revertColor();
    })
    if (this.selectedPiece) this.selectedPiece.highlight();
  }

  highlightGroupsInSelected(){
    if (!this.selectedPiece) return;
    // for(const obj in this.cube.tGS){
    //   const pp = this.cube.tGS[obj];
    //   if (pp.includes(this.selectedPiece)) {
    //     pp.forEach(x=>{
    //       if (x) {
    //         x.highlight({amp:0.9});
    //       }
    //     })  
    //   }
    // }
    Object.values(this.cube.tGS)
      .filter(group => group.includes(this.selectedPiece))
      .forEach(group =>
        group.forEach(x => x?.highlight({ amp: 0.1 }))
      );
    
  }


  refreshFacePlane(ev){
    this.pointsPlane.length = 0;
    this.pointsPlane.push(this.hits1[0]);
    this.displayFacePlane(this.pointsPlane[0]);
  }

  refreshDirectionArrow(ev){
    this.arrowDirOriginV.copy(this.pointsPlane[0].point);
    this.arrowDirV.set(0, 0, 1);
    this.arrowDirHelper.position.copy(this.arrowDirOriginV);
    this.arrowDirHelper.setDirection(this.arrowDirV);
    if (this.showDirectionArrow) {
      this.arrowDirHelper.visible = true;
    }
  }

  refreshPieceFaceNormal(hit){
    // stores the face normal for later stuff
    // also moves the faceArrow into the face of the selected hitzone

    // --- get world normal ---
    this.normalMatrix.getNormalMatrix(hit.object.matrixWorld);
    this.worldNormal.copy(hit.face.normal).applyMatrix3(this.normalMatrix).normalize();
    // at this point this.worldNormal is the nessesary first axis for the cross product
    
    if(this.useFaceArrowDebugger){
      this.faceArrow.visible = true;
      this.faceArrow.position.copy(hit.point);
      
      this.box1.setFromObject(hit.object);
      this.box1.getCenter(this.centerV);
      // project onto face using normal
      this.centerV.addScaledVector(this.worldNormal, this.box1.getSize(this.sizeV).length() / 6);

      // --- position arrow at hit point ---
      this.faceArrow.position.copy(this.centerV);
      // --- orient arrow ---
      this.faceArrow.setDirection(this.worldNormal);
      
    }
 
  }


  // previous
  trySelectingPiece(ev){
    return;
    if (false) {
      return;
    }
    
//if(this.activePointers.size > 1) return;
    
    // if (!this.IS_DOWN) return;
    // if (!this.camera || !this.cube || !this.domElement) return null;
    
    const v1 = this.getScreenCoords(ev);
    this.raycaster.setFromCamera(v1, this.camera);

    const zones = this.cube.pieces.flatMap(piece => piece.hitZone);

    this.hits1 = this.raycaster.intersectObjects(zones, false);
    console.log(this.hits1);
    
    const ball = this.planePool.requestItem();
    if(this.hits1.length > 0){
      this.IS_DOWN = true;
      this.controls.enabled = false;
      
      ball.visible = true;
      ball.position.copy(this.hits1[0].point);
      
      this.selectPiece();
      if(this.useFaceArrowDebugger){
        this.displayFaceArrow(this.hits1[0]);
      }
    }
    if(this.IS_DOWN ){
      // now do hit tests on the plane
      const ballOnPlane = this.planePoolGrid.requestItem();
      ballOnPlane.visible = true;

      // assuming .point is world
      // otherwise remove else 
      // so we dont have two same starter points
      if(this.lockGridDown === false){
          this.lockGridDown = true;
          this.pointsPlane.length = 0;
          this.pointsPlane.push(this.hits1[0]);
          this.pointDown3D.copy(this.pointsPlane[0].point);
          this.displayFacePlane(this.pointsPlane[0]);
          this.arrowDirOriginV.copy(this.pointsPlane[0].point);
          this.arrowDirV.set(0, 0, 1);
          this.arrowDirHelper.position.copy(this.arrowDirOriginV);
          this.arrowDirHelper.setDirection(this.arrowDirV);
          this.arrowDirHelper.visible = true;
        }
      else {
        this.hitsPlane = this.raycaster.intersectObject(this.planeHitZone3D, false);
        if(this.hitsPlane.length > 0){
          this.pointsPlane.push(this.hitsPlane[0]);
          if(this.pointsPlane.length>0){
            ballOnPlane.position.copy(this.hitsPlane[0].point);
            this.getAveragePointFromHits(this.pointsPlane, this.movingAveragePointV);
            this.currentDragDistance = this.pointDown3D.distanceTo(this.hitsPlane[0].point);
            this.updateDistanceHud(this.currentDragDistance);
            if (this.currentDragDistance >= this.triggerDistance && this.lastTriggeredDistance < this.triggerDistance) {
              this.lastTriggeredDistance = this.currentDragDistance;
              this.popThresholdBubble(this.currentDragDistance);
            }
            this.arrowDirV.copy(this.movingAveragePointV).sub(this.arrowDirOriginV);
            const dirLen = this.arrowDirV.length();
            if (dirLen > 0.000001) {
              this.arrowDirV.multiplyScalar(1 / dirLen);
              this.arrowDirHelper.position.copy(this.arrowDirOriginV);
              this.arrowDirHelper.setDirection(this.arrowDirV);
            }
          }
        }
        
      }
    
      
      
      
  }
      
    
  }



  seeking(ev){
    if (this.state === states.onCube) {
      this.state = states.seeking;
    }
    if (this.state !== states.seeking) return;
    this.getHits(ev);
    
    // this is just to show points on the cube
    const ball = this.planePool.requestItem();
    if(this.hits1.length > 0){
      ball.visible = true;
      ball.position.copy(this.hits1[0].point);
      // this.selectPiece();
    }

    this.seekingPointsOnPlane(ev);
    
  }

  seekingPointsOnPlane(ev){
    // raycaster has been updated before this
    
    this.hitsPlane = this.raycaster.intersectObject(this.planeHitZone3D, false);
    
    if(this.hitsPlane.length > 0){
      
      this.pointsPlane.push(this.hitsPlane[0]);
      
      if(this.pointsPlane.length>0){
        console.log("????");
        
        if(this.showPlaneBallDebugger){
          const ballOnPlane = this.planePoolGrid.requestItem();
          ballOnPlane.visible = true;
          ballOnPlane.position.copy(this.hitsPlane[0].point);
        }

        this.updateDirectionCheck(ev);

      }
    }
    
  }

  pv0 = new THREE.Vector3();
  pv1 = new THREE.Vector3();
  pv2 = new THREE.Vector3();


  has_dihffg = false;
  ballA = null;
  ballB = null;
  matrixA = new THREE.Matrix3();
  boxaA1 = null;
  Vsdhjkf111 = new THREE.Vector3();
  updateDirectionCheck(ev){
    if(!this.has_dihffg){
      this.has_dihffg = true;
      const ballGeoA = new THREE.SphereGeometry(0.1, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xffbb22 });
      const markerMat2 = new THREE.MeshBasicMaterial({ color: 0xaa22ff });
      this.ballA = new THREE.Mesh(ballGeoA, markerMat);
      this.ballB = new THREE.Mesh(ballGeoA, markerMat2);
      this.scene.add(this.ballA);
      this.scene.add(this.ballB);

      const aa = 0.2;
      const c1 = new THREE.BoxGeometry( aa,aa,aa );
      const markerMat2sdf = new THREE.MeshBasicMaterial({ color: 0xaa22ff });
      this.boxaA1 = new THREE.Mesh(c1, markerMat2sdf);
      this.scene.add(this.boxaA1);

    }
    // this was AI, its job isa to get the average
    // of the points to get the direction on the plane
    // then over a threshold, activate the next states

    this.getAveragePointFromHits(this.pointsPlane, this.movingAveragePointV);
    this.currentDragDistance = this.pointDown3D.distanceTo(this.hitsPlane[0].point);
    this.updateDistanceHud(this.currentDragDistance);
    if (this.currentDragDistance >= this.triggerDistance && this.lastTriggeredDistance < this.triggerDistance) {
      this.lastTriggeredDistance = this.currentDragDistance;
      this.popThresholdBubble(this.currentDragDistance);
    }
    this.arrowDirV.copy(this.movingAveragePointV).sub(this.arrowDirOriginV);
    const dirLen = this.arrowDirV.length();
    if (dirLen > 0.000001) {
      this.arrowDirV.multiplyScalar(1 / dirLen);
      this.arrowDirHelper.position.copy(this.arrowDirOriginV);
      this.arrowDirHelper.setDirection(this.arrowDirV);
    }

    // // ok from here we need to atan2 in local space
    // // then test north east etc...
    this.pv0.copy(this.arrowDirOriginV);
    this.pv1.copy(this.arrowDirV).add(this.arrowDirOriginV);
    this.planeHitZone3D.updateMatrix();
    this.ballA.position.copy(this.pv0);
    this.ballB.position.copy(this.pv1);
    this.planeHitZone3D.worldToLocal(this.pv0);
    this.planeHitZone3D.worldToLocal(this.pv1);
    this.pv2.copy(this.pv1).sub(this.pv0);

    this.Vsdhjkf111.set(0,1,0);
    this.Vsdhjkf111.set(2,0,0);
    this.planeHitZone3D.localToWorld(this.Vsdhjkf111);
    // plane y is up or its face!!
    this.boxaA1.position.copy(this.Vsdhjkf111);

    // this.pv2.normalize();
    // const angle = Math.atan2(this.pv2.y, this.pv2.x);
    // console.log("angle", angle);
    
    // need to fix the rotation _setMinAndMaxByKey
    // chaty had something about inverse matrix thus a rotation in the mix


    // build normal matrix (inverse rotation)
    // this.matrixA.identity().getNormalMatrix(this.planeHitZone3D.matrixWorld);
//     // transform direction into local space
    // this.pv2.copy(this.arrowDirV).applyMatrix3(this.matrixA).normalize();
    // this.pv2.applyMatrix3(this.matrixA).normalize();
    console.log(this.pv2);
    

// // compute angle in plane-local space
// const angle = Math.atan2(this.pv2.y, this.pv2.x);

// console.log("angle", angle);

// get plane world rotation
// const quat = this.planeHitZone3D.getWorldQuaternion(new THREE.Quaternion());

// // invert it (this "undoes" the plane's rotation)
// const invQuat = quat.clone().invert();

// // rotate your direction into "unrotated plane space"
// this.pv2.copy(this.arrowDirV).applyQuaternion(invQuat).normalize();

// // now you're in a flat reference frame
// const angle = Math.atan2(this.pv2.y, this.pv2.x);

// console.log("angle", angle, this.pv2);


  }

  // runBallOnCube(){

  // }

  //previous
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
  displayFacePlane(hit){

    // this is already done in refreshPieceFaceNormal
    // this.normalMatrix.getNormalMatrix(hit.object.matrixWorld);
    // this.worldNormal.copy(hit.face.normal).applyMatrix3(this.normalMatrix).normalize();
    
    // this.faceGridHelper.quaternion.setFromUnitVectors(this.upV, hit.normal);
    
    this.planeHitZone3D.position.copy(hit.point);
    this.planeHitZone3D.quaternion.setFromUnitVectors(this.upV, this.worldNormal);

    if(this.useFaceGridDebugger){
      this.planeHitZone3D.visible = true;
    }

    // alternative using infinite math plane and its helper
    // in practice this is not a solution 
    //this.planeMath.set(this.worldNormal,-hit.point.length())
  }

  // selectPiece(hit){
  //   if(this.selectedPiece === null){
  //     this.selectedPiece = hit.object;
  //     // console.log(this.selectedPiece);
      
  //     this.cube.pieces.forEach(x=>{
  //       x.revertColor();
  //     })

  //     if(this.selectedPiece.parent?.isPiece){
  //       this.selectedPiece.parent.highlight();
  //     }
  //   }
  // }

// utilites

  getScreenCoords(ev){
    const rect = this.domElement.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    return this.screenCoordsV.set(x, y);
  }

  
  getAveragePointFromHits(hits, output){
    output.set(0, 0, 0);
    if(hits.length === 0) return output;
    hits.forEach(x => {
      output.add(x.point);
    });
    output.divideScalar(hits.length);
    return output;
  }

  dispose() {
    this.domElement?.removeEventListener("pointerdown", this.onPointerDown);
    this.domElement?.removeEventListener("pointermove", this.onPointerMove);
    this.domElement?.removeEventListener("pointerup", this.onPointerUp);
    this.domElement?.removeEventListener("pointercancel", this.onPointerUp);
    this.domElement?.removeEventListener("pointerleave", this.onPointerUp);
    if (this.distanceHudEl) {
      this.distanceHudEl.remove();
      this.distanceHudEl = null;
    }
    if (this.thresholdBubbleTimeout) {
      window.clearTimeout(this.thresholdBubbleTimeout);
      this.thresholdBubbleTimeout = null;
    }
  }

}
