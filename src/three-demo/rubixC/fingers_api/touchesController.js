import { 
	Vector2, Vector3, Raycaster, Group, PlaneGeometry,
	Matrix4, MeshBasicMaterial, Mesh
} from "three";
import { SlightlyPriceyPool } from '../slightlyPriceyPool.js';
import { Session } from './session.js';
import { Pools } from './pools.js';
import { MagicPlane } from './magicPlane.js';
import { Plucker } from './plucker.js';


const states = {
  idle : "idle",
  onCube : "onCube",
  seeking : "seeking",
  found : "found",
  following : "following",
  rolling : "rolling"
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

	session = new Session();

	plucker;

  hitDown = null; // is a hit object with .point for position


	hitZones; // [] zones on the piece to hit instead of faces

	// hitZonePlane3D;
	// hitZonePlane3D;
	magicPlane;

	selectedPiece = null;

	currentDragDistance = 0;
	lastTriggeredDistance = 0;

	raycaster = new Raycaster();
	screenCoordsV = new Vector2();
  pointDown3D = new Vector3(); // world position

  visualsObject3D; // visuals...

  // this.hits1 is now
  // this.session.points.cubeRayHits

  /*
  debugger toggles
  */
  visuals = {
  	// showCubePoints : false
  	showCubePoints : true,
  	showPlanePoints : true
  }

  /*
		
  */
  // pools = {
  // 	plane : new SlightlyPriceyPool()
  // }

  pools;



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

		this.magicPlane = new MagicPlane({fingersAPI:this.ff});

		this.plucker = new Plucker({fingersAPI:this.ff});

		/*
		visual helpers
		*/
    // this.buildVisualHelpers();

		this.pools = new Pools({fingersAPI:this.ff, cubePointsMax:22});



	}


  /*
    Touch events
  */


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
  	if (this.checkIsMultitouch(ev)) return;

    this.IS_DOWN = true;
    this.currentDragDistance = 0;
    this.lastTriggeredDistance = 0;
		
		// multi touch would break this for now
		this.session.reset();

    
    this.tryPointerDown(ev);

    // this belongs in a diffenrnt class file
    // as some event lisnters
	    // this.updateDistanceHud(0);
    // emit "yo_onPointerDownComplete"
  }


  onPointerMove(ev){
  	if (this.checkIsMultitouch(ev)) return;

    if (!this.isOnCube) return;
    
    this.seeking(ev);
  }
  
  onPointerUp(ev){
  	// keeping tracks of touches count
    this.activePointers.delete(ev.pointerId);
    if (this.activePointers.size > 0) return;

    this.resetInteractionState();
  }


  checkIsMultitouch(ev){
		// here we need to ignore multi touch??¿¿
		// and quit touch events
		// so orbit works

    this.activePointers.set(ev.pointerId, ev);
    if (this.activePointers.size > 1) {
      this.resetInteractionState();
      return true;
    }
    return false;
  }


  /*
    State cleaners
  */

  resetInteractionState() {
    this.state = states.idle;
    this.isOnCube = false;
    this.ff.controls.enabled = true;
    this.IS_DOWN = false;
    this.selectedPiece = null;
    this.lockGridDown = false;
    this.lastTriggeredDistance = 0;
					    
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







  /*
    
    Core logic event from touch events
    
  */

  tryPointerDown(ev){

  	this.plucker.reset();
  	
    this.getHitsOnCube(ev);

    // this block checks if there was a hit on the cube, if so
    // store stuff and lock the orbit controls to begin dragging points
    if(this.session.points.cubeRayHits.length > 0){

      // figuring out the nessesary flag states
      this.IS_DOWN = true;
      this.state = states.onCube;
      this.isOnCube = true;

			this.hitDown = this.session.points.cubeRayHits[0];
      this.pointDown3D.copy(this.hitDown.point);

      this.ff.controls.enabled = false;

			this.selectPiece(this.hitDown);
			
			this.magicPlane.refresh(this.hitDown);

    }



  }


  getHitsOnCube(ev){
  	// assigns cubes points, also store the hits cause this is called in ever dragging frame

    const v1 = this.getScreenCoords(ev);
    this.raycaster.setFromCamera(v1, this.ff.camera);

    // it retain when its an argument
    this.session.points.cubeRayHits = this.raycaster.intersectObjects(this.hitZones, false);

    // here well store that new point
    if(this.session.points.cubeRayHits.length > 0){
	    this.session.points.cube.push(this.session.points.cubeRayHits[0]);
    }

    // console.log("hits", this.session.points.cube);
    console.log("hits", this.session.points.cubeRayHits);

  }

  selectPiece(hit){

  	if(this.selectedPiece){
	  	this.selectedPiece = null;
  		// this.selectedPiece.revertColor();
  	}
    if(hit.object.parent?.isPiece){
      this.selectedPiece = hit.object.parent;
      this.selectionDownLine?.syncFromSelection(this.selectedPiece, this.ff.cube?.core ?? this.ff.cube);
    }

    if(this.selectedPiece){
    	// this.selectedPiece.setColorOverAll(0xffffff);
    }
    // console.log(this.selectedPiece);
  }


  /*
		seeking
	
  */

  seeking(ev){
  	this.seekOnCube(ev);
    
    this.seekingOnHitZonePlane(ev);

    this.plucker.refreshDirectionArrow();
  }


  seekOnCube(ev){

  	if (this.state === states.onCube) {
      this.state = states.seeking;
      // this.colapsePlaneBalls();
    }


    if (this.state !== states.seeking) return;
    this.getHitsOnCube(ev);
    
    
    // this is just to show points on the cube
    if(this.visuals.showCubePoints){

	    // const ball = this.planePool.requestItem();
	    const ball = this.pools.cube.meshes.requestItem();
	    if(this.session.points.cubeRayHits.length > 0){
	      ball.visible = true;
	      // ball.position.copy(this.hits1[0].point);
	      ball.position.copy(this.session.points.cubeRayHits[0].point);
	      // this.selectPiece();
	    }

    }

  }




  // seekingPointsOnPlane(ev){
  seekingOnHitZonePlane(ev){
    // raycaster has been updated before this
    
    // this.hitsPlane = this.raycaster.intersectObject(this.planeHitZone3D, false);
    this.session.points.planeRayHits = this.raycaster.intersectObject(this.magicPlane.hitZonePlane, false);
    
    const hits = this.session.points.planeRayHits;
    if(hits.length > 0){
      
      this.session.points.plane.push(hits[0]);
      
      if(this.session.points.plane.length>0){
        console.log("????");
        
        if(this.visuals.showPlanePoints){
          const ballOnPlane = this.pools.plane.meshes.requestItem();
          ballOnPlane.visible = true;
          ballOnPlane.position.copy(hits[0].point);
        }

        // not yet
        // this.updateDirectionCheck(ev);

      }
    }
    
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
