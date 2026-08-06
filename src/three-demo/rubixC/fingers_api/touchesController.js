import { 
	Vector2, Vector3, Raycaster, Group, PlaneGeometry,
	Matrix4, Matrix3, MeshBasicMaterial, Mesh, ArrowHelper, Quaternion
} from "three";
import { SlightlyPriceyPool } from '../slightlyPriceyPool.js';
import { Session } from './session.js';
import { Pools } from './pools.js';
import { MagicPlane } from './magicPlane.js';
import { Plucker } from './plucker.js';
import { DirectionArrow } from './directionArrow.js';
import { MultitouchEngine } from './multitouchEngine.js';
import { SelectedPiece } from './selectedPiece.js';


const magicPlaneEvents = {
  thresholdReached: "magicplane:threshold-reached",
};

const remap = (value, oldMin, oldMax, newMin, newMax) =>
  ((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;

const states = {
  idle : "idle",
  onCube : "onCube",
  seeking : "seeking",
  found : "found",
  following : "following",
  rolling : "rolling",
  activeTumbling : "activeTumbling",
  snapping : "snapping"
}

export class TouchesController {
	
	ff = null; // fingersAPI
	// camera;
	// domElement;
	// scene;
	
	state = states.idle;
	isOnCube = false;
	IS_DOWN = false;

	activePointers = new Map();
	events = new EventTarget();
	
	multitouch = new MultitouchEngine(); // not an engine to the solver

	engines = {
		session: new Session(),
		magicPlane: null,
		plucker: null,
		directionArrow: null,
		pools: null,
		normalsDebugger: null
	}


  hitDown = null; // is a hit object with .point for position


	hitZones; // [] zones on the piece to hit instead of faces


	selectedPiece = null;
  // just used to console debug with
  m_selectedPiece = null;

	currentDragDistance = 0;
	lastTriggeredDistance = 0;
	lastTumbleDelta = 0;
	snapAnimationFrame = null;

	raycaster = new Raycaster();
	screenCoordsV = new Vector2();
  // pointDown3D = new Vector3(); // world position

  visualsObject3D; // visuals...

  // this.hits1 is now
  // this.engines.session.points.cubeRayHits

  /*
  debugger toggles
  */
  visuals = {
		showCubePoints : false,
		showPlanePoints : false
  }

  /*
		
  */
  // pools = {
  // 	plane : new SlightlyPriceyPool()
  // }




	// constructor({domElement, cube, camera, controls, scene}={}){
	constructor({fingersAPI}={}){
		// this.ff.domElement = domElement;
		// this.cube = cube;
		// this.camera = camera;
		// this.controls = controls;
		// this.scene = scene;

		if(!fingersAPI){
			console.warn("!!!! must have a fingersAPI")
			return 
		}
		this.ff = fingersAPI;

		if(this.ff.cube?.pieces){			
			this.hitZones = this.ff.cube.pieces.flatMap(piece => piece.hitZone);
		}


		this.onPointerDown = this.onPointerDown.bind(this);
		this.onPointerMove = this.onPointerMove.bind(this);
		this.onPointerUp = this.onPointerUp.bind(this);

		this.beginPointerEvents();

		this.engines.magicPlane = new MagicPlane({fingersAPI:this.ff});

		this.engines.plucker = new Plucker({fingersAPI:this.ff});

		// this.buildArrow();
		this.engines.directionArrow = new DirectionArrow({fingersAPI:this.ff});

		/*
		visual helpers
		*/
    // this.buildVisualHelpers();

		this.engines.pools = new Pools({fingersAPI:this.ff, cubePointsMax:22});

	}


  /*
    Touch events
  */


  addEventListener(type, listener, options){
    this.events.addEventListener(type, listener, options);
  }

  removeEventListener(type, listener, options){
    this.events.removeEventListener(type, listener, options);
  }

  emit(type, detail = {}){
    this.events.dispatchEvent(new CustomEvent(type, { detail }));
  }


  beginPointerEvents() {
    if (!this.ff.domElement) return;
    this.ff.domElement.style.touchAction = "none";
    this.ff.domElement.addEventListener("pointerdown", this.onPointerDown);
    this.ff.domElement.addEventListener("pointermove", this.onPointerMove);
    this.ff.domElement.addEventListener("pointerup", this.onPointerUp);
    this.ff.domElement.addEventListener("pointercancel", this.onPointerUp);
    this.ff.domElement.addEventListener("pointerleave", this.onPointerUp);
  }



  onPointerDown(ev){
    const touchState = this.multitouch.pointerDown(ev);

    if (touchState.shouldAbortDrawing) {
      this.quitDrawingForMultitouch(ev);
      return;
    }

    this.IS_DOWN = true;
    this.currentDragDistance = 0;
    this.lastTriggeredDistance = 0;
		
		window.ff = this.ff;
		this.engines.session.reset();

    
    this.tryPointerDown(ev);

    // this belongs in a diffenrnt class file
    // as some event lisnters
	    // this.updateDistanceHud(0);
    // emit "yo_onPointerDownComplete"
  }


  onPointerMove(ev){
    const touchState = this.multitouch.pointerMove(ev);
    if (touchState.shouldAbortDrawing) this.quitDrawingForMultitouch(ev);
    if (!touchState.shouldDraw) return;

    if (!this.isOnCube) return;
    
    this.seeking(ev);
  }
  
  onPointerUp(ev){
    const touchState = this.multitouch.pointerUp(ev);

    if (touchState.hasActivePointers) return;
    if (touchState.shouldSkipTouchUp) {
      this.resetInteractionState();
      return;
    }

    if(this.state === states.activeTumbling && this.beginReleaseSnap()){
      return;
    }

    if(this.didFlick()){
      // Flick completion will be handled separately. For now it intentionally
      // falls through to the same cleanup as every other release.
    }

    // Keep the completed drag available until its release action has run, then
    // flush every store so the next touch cannot reuse stale session data.
    this.resetInteractionState();

  }


  beginReleaseSnap(){
    const group = this.engines.plucker?.plucked?.group;
    const cube = this.ff.cube;
    const direction = Math.sign(this.lastTumbleDelta);
    if(!group || !group.axis || !direction || !cube?.spinGroup) return false;

    const quarterTurn = Math.PI / 2;
    const turns = this.lastTumbleDelta / quarterTurn;
    const targetTurns = direction > 0
      ? Math.ceil(turns - Number.EPSILON)
      : Math.floor(turns + Number.EPSILON);
    const targetAngle = targetTurns * quarterTurn;
    const remainingAngle = targetAngle - this.lastTumbleDelta;

    this.state = states.snapping;
    const duration = this.ff.snapDuration ?? 250;
    const requestFrame = globalThis.requestAnimationFrame
      ?? (callback => setTimeout(() => callback(performance.now()), 16));
    const startQuaternion = new Quaternion();
    const targetQuaternion = new Quaternion().setFromAxisAngle(group.axis, remainingAngle);
    const frameQuaternion = new Quaternion();
    let previousAngle = 0;
    let startTime = null;

    const finish = () => {
      cube.refishGroups?.();
      this.snapAnimationFrame = null;
      this.resetInteractionState();
    };

    const animate = now => {
      if(startTime === null) startTime = now;
      const progress = duration <= 0 ? 1 : Math.min((now - startTime) / duration, 1);
      const easedProgress = progress * progress * (3 - 2 * progress);
      frameQuaternion.slerpQuaternions(startQuaternion, targetQuaternion, easedProgress);
      const currentAngle = remainingAngle === 0
        ? 0
        : Math.sign(remainingAngle) * 2 * Math.acos(Math.min(1, Math.abs(frameQuaternion.w)));
      const deltaAngle = currentAngle - previousAngle;
      previousAngle = currentAngle;

      if(deltaAngle !== 0) cube.spinGroup({group, deltaAngle});
      if(progress < 1){
        this.snapAnimationFrame = requestFrame(animate);
      } else {
        finish();
      }
    };

    this.snapAnimationFrame = requestFrame(animate);
    return true;
  }


  /*
    State cleaners
  */

  resetInteractionState() {
    this.releasePools();
    this.engines.session.reset();
    this.engines.plucker?.reset();
    this.state = states.idle;
    this.isOnCube = false;
    this.ff.controls.enabled = true;
    this.IS_DOWN = false;
    this.hitDown = null;
    this.selectedPiece = null;
    this.m_selectedPiece = null;
    this.lockGridDown = false;
    this.currentDragDistance = 0;
    this.lastTriggeredDistance = 0;
		this.lastTumbleDelta = 0;
					    
					    // these feel like they belong in some other order thing
					    // move this // this.updateDistanceHud(0);
					    // if (this.selectionDownLine) {
					    //   this.selectionDownLine.visible = false;
					    // }
					    // if (this.clampedDirectionHelper) {
					    //   this.clampedDirectionHelper.visible = false;
					    // }

    // Keep the last cross-product direction visible after the touch ends so it
    // remains available as a visual reference until the next selection updates it.
  }







  quitDrawingForMultitouch(ev){
    this.releaseActivePointerCaptures();
    this.resetInteractionState();
  }


  releaseActivePointerCaptures(){
    const domElement = this.ff.domElement;
    const releasePointerCapture = domElement?.releasePointerCapture?.bind(domElement);
    if(!releasePointerCapture) return;

    this.multitouch.activePointers.forEach((_, pointerId) => {
      releasePointerCapture(pointerId);
    });
  }


  releasePools(){
    const pools = this.engines.pools;
    const meshPools = [pools?.cube?.meshes, pools?.plane?.meshes];

    meshPools.forEach(pool => {
      if(!pool) return;
      pool.selectedIndex = 0;
      pool.forEach(mesh => {
        // mesh.visible = false;
      });
    });
  }





  /*
    
    Core logic event from touch events
    
  */

  tryPointerDown(ev){

		this.engines.directionArrow.reset();
		// this.engines.plucker.reset();

    this.getHitsOnCube(ev);

    // this block checks if there was a hit on the cube, if so
    // store stuff and lock the orbit controls to begin dragging points
    if(this.engines.session.points.cubeRayHits.length > 0){

      // figuring out the nessesary flag states
      this.IS_DOWN = true;
      this.state = states.onCube;
      this.isOnCube = true;

			this.hitDown = this.engines.session.points.cubeRayHits[0];
      // this.pointDown3D.copy(this.hitDown.point);

      this.ff.controls.enabled = false;

			this.selectPiece(this.hitDown);
			
			this.engines.magicPlane.refresh(this.hitDown);

      // this.engines.plucker.refreshAxises(this.hitDown);
      const piece = this.selectedPiece?.piece;
      if(piece){

        // this.engines.plucker.pluck(this.hitDown, piece);
        this.engines.plucker.onDown(this.hitDown, piece);
      }

    }



  }


  getHitsOnCube(ev){
  	// assigns cubes points, also store the hits cause this is called in ever dragging frame

    const v1 = this.getScreenCoords(ev);
    this.raycaster.setFromCamera(v1, this.ff.camera);

    // it retain when its an argument
    this.engines.session.points.cubeRayHits = this.raycaster.intersectObjects(this.hitZones, false);

    // here well store that new point
    if(this.engines.session.points.cubeRayHits.length > 0){
	    this.engines.session.points.cube.push(this.engines.session.points.cubeRayHits[0]);
    }

    // console.log("hits", this.engines.session.points.cube);
    // console.log("hits", this.engines.session.points.cubeRayHits);

  }

  selectPiece(hit){

  	if(this.selectedPiece){
	  	this.selectedPiece = null;
  		// this.selectedPiece.revertColor();
  	}
    if(hit.object.parent?.isPiece){
      this.selectedPiece = new SelectedPiece(hit);
      this.selectionDownLine?.syncFromSelection(this.selectedPiece, this.ff.cube?.core ?? this.ff.cube);
    }

    if(this.selectedPiece){
    	// this.selectedPiece.setColorOverAll(0xffffff);
    }
    // console.log(this.selectedPiece);
  }


  /*
		seeking
    happens after two points are available
  */

  seeking(ev){
  	this.seekOnCube(ev);
    
    this.seekingOnHitZonePlane(ev);

    this.checkMagicPlaneDistanceThreshold();

    this.engines.directionArrow.refresh();

    if(this.engines.session.points.plane.length > 2){
      this.state = states.activeTumbling;
    }

    if(this.state === states.activeTumbling) this.updateActiveTumble();

  }


  seekOnCube(ev){

  	if (this.state === states.onCube) {
      this.state = states.seeking;
      // this.colapsePlaneBalls();
    }


    if (this.state !== states.seeking && this.state !== states.activeTumbling) return;
    this.getHitsOnCube(ev);
    
    
    // this is just to show points on the cube
    if(this.visuals.showCubePoints){

	    // const ball = this.planePool.requestItem();
	    const ball = this.engines.pools.cube.meshes.requestItem();
	    if(this.engines.session.points.cubeRayHits.length > 0){
	      ball.visible = true;
	      // ball.position.copy(this.hits1[0].point);
	      ball.position.copy(this.engines.session.points.cubeRayHits[0].point);
	      // this.selectPiece();
	    }

    }

  }




  // seekingPointsOnPlane(ev){
  seekingOnHitZonePlane(ev){
    // raycaster has been updated before this
    
    // this.hitsPlane = this.raycaster.intersectObject(this.planeHitZone3D, false);
    this.engines.session.points.planeRayHits = this.raycaster.intersectObject(this.engines.magicPlane.hitZonePlane, false);
    
    /*
      THIS needs some more checks, its going THOUGh the cube
      only SOMETIMES
    */
    const hits = this.engines.session.points.planeRayHits;
    if(hits.length > 0){
      
      this.engines.session.points.plane.push(hits[0]);
      
      if(this.engines.session.points.plane.length>0){
        // console.log("????");
        
        if(this.visuals.showPlanePoints){
          const ballOnPlane = this.engines.pools.plane.meshes.requestItem();
          ballOnPlane.visible = true;
          ballOnPlane.position.copy(hits[0].point);
        }

        // not yet
        // this.updateDirectionCheck(ev);

      }
    }
    
  }



  checkMagicPlaneDistanceThreshold(){
    const planePoints = this.engines.session.points.plane;
    const pointDown = this.hitDown?.point;
    const recentPoint = planePoints[planePoints.length - 1]?.point;
    const triggerDistance = this.ff.triggerDistance ?? 0.35;

    if(!pointDown || !recentPoint || triggerDistance <= 0) return;

    this.currentDragDistance = pointDown.distanceTo(recentPoint);

    if(this.currentDragDistance < triggerDistance) return;
    if(this.currentDragDistance - this.lastTriggeredDistance < triggerDistance) return;

    this.lastTriggeredDistance = this.currentDragDistance;
    this.emit(magicPlaneEvents.thresholdReached, {
      distance: this.currentDragDistance,
      threshold: triggerDistance,
      hitDown: this.hitDown,
      recentPoint,
    });
  }


  getTumbleDelta(){
    let tumbleDelta = this.engines.directionArrow.getDragDistance();
    const tumbleSign = Math.sign(tumbleDelta);
    tumbleDelta = remap(Math.abs(tumbleDelta), 0, 3, 0, Math.PI / 2);
    return tumbleDelta * tumbleSign * -1;
  }


  updateActiveTumble(){
    const piece = this.selectedPiece?.piece;
    if(!piece) return;

    const direction = this.engines.directionArrow.getAbsoluteDirection();
    const plucked = this.engines.plucker.pluck(this.hitDown, piece, direction);
    if(!plucked?.group) return;

    const tumbleDelta = this.getTumbleDelta();
    const frameDelta = tumbleDelta - this.lastTumbleDelta;
    this.lastTumbleDelta = tumbleDelta;
    if(frameDelta === 0) return;

    const force = plucked.force.setLength(frameDelta);
    this.ff.cube.torqueGroup({group:plucked.group, leverV:plucked.leverV, forceV:force});
  }


  didFlick(){
    return false;
  }


  /*
		Builders
  */




  /*
		utilites
  */

  getScreenCoords(ev){
  	// returns pointer to Vector2

    const rect = this.ff.domElement.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    return this.screenCoordsV.set(x, y);
  }








 /*
    ai just dumped eveything into here, its now a mess

  */
  buildVisualHelpers(){
    // this.arrowOut = new ThickArrowHelper(this.arrowDirection, this.arrowOrigin, 0.01, 0x111111, 0.15, 0.08);
    // this.arrowOut.visible = false;
    // this.planePoolHolder3D.add(this.arrowOut);

    //// this.visualsObject3D = new Group();
    //// this.ff.scene.add(this.visualsObject3D);

    // this.faceArrow = new ThickArrowHelper(this.arrowDirectionV, this.arrowOriginV, 1.1, 0x2d7fff, 0.18, 0.1);
    // this.faceArrow.visible = false;
    // this.visualsObject3D.add(this.faceArrow);

    // this.faceGridHelper = new GridHelper(3, 12, 0x2d7fff, 0x2d7fff);
    // this.faceGridHelper.visible = false;
    // this.planeHitZone3D.add(this.faceGridHelper);

    // //this.planeMath = new THREE.Plane( new Vector3( 1, 1, 0 ), 4 );
    // //this.planeHelper = new THREE.PlaneHelper( this.planeMath, 4, 0xafff00 );
    // //this.visualsObject3D.add( this.planeHelper );

    
    // this.arrowDirHelper = new ThickArrowHelper(this.arrowDirV, this.arrowDirOriginV, 5.1, 0xffffff, 0.18, 0.1);
    // //this.arrowDirHelper.visible = false;
    // this.visualsObject3D.add(this.arrowDirHelper);

    // this.crossDirHelper = new ThickArrowHelper(this.crossDirV, this.crossDirOriginV, 1.2, 0xff33cc, 0.18, 0.1);
    // this.crossDirHelper.visible = false;
    // this.visualsObject3D.add(this.crossDirHelper);

    // this.clampedDirectionHelper = new ThickArrowHelper(
    //   this.clampedDirectionV,
    //   this.clampedDirectionOriginV,
    //   this.clampedDirectionHelperLength,
    //   0xff8c00,
    //   0.16,
    //   0.12,
    //   0.08,
    // );
    // this.clampedDirectionHelper.visible = false;
    // this.visualsObject3D.add(this.clampedDirectionHelper);

    // this.positiveCrossDirHelper = new ThickArrowHelper(
    //   this.positiveCrossDirV,
    //   this.positiveCrossDirOriginV,
    //   this.positiveCrossDirHelperLength,
    //   0x6f8fa6,
    //   0.32,
    //   0.18,
    //   0.08,
    // );
    // this.positiveCrossDirHelper.visible = false;
    // this.visualsObject3D.add(this.positiveCrossDirHelper);

    // this.selectionDownLine = new DebugSelectionDownLine({ length: 1.5, radius: 0.03, color: 0x000000 });
    // this.visualsObject3D.add(this.selectionDownLine);

    // const pluckerBallGeo = new SphereGeometry(1, 16, 16);
    // const pluckerBallMat = new MeshBasicMaterial({ color: 0xff0000 });
    // this.pluckerBall = new Mesh(pluckerBallGeo, pluckerBallMat);
    // this.pluckerBall.visible = false;
    // this.visualsObject3D.add(this.pluckerBall);
		// this.pluckerBall.scale.setScalar(0.05);
  }



}

/*
	
	extras
	
*/

// class PointsDataModel{
// 	points = [];
// 	reset(){
// 		this.points.length = 0;
// 	}
// 	add(point){
// 		this.points.push(point);
// 	}
// }
