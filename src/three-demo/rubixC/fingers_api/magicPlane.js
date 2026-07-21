import { 
	Vector2, Vector3, Raycaster, Group, PlaneGeometry,
	Matrix4, MeshBasicMaterial, Mesh, Box3
} from "three";

// import { ThickArrowHelper, ThickAxesHelper } from "../utilites/thickAxesHelper.js";
import { ThickArrowHelper } from "../utilites/thickArrowHelper.js";


export class MagicPlane{
	
	ff;

	hitZonePlane;

	worldNormal = new Vector3();
	faceCenterV = new Vector3();
	sizeV = new Vector3();
	centerV = new Vector3();
	upV = new Vector3(0,1,0);


	useVisuals = true;

	faceArrow;
	arrowDirectionV = new Vector3();
	arrowOriginV = new Vector3();
	box1 = new Box3();

	// points = [];

	constructor({fingersAPI}={}){
		this.ff = fingersAPI;
		this.build();
		this.buildVisuals();
	}


	/*
		this is a core unit of the selecting and logic
		so while it is also a visual, it belongs at top level
	*/

	// buildHitZonePlane(){
	build(){

	  // this.planePoolGrid  = new SlightlyPriceyPool({rootObject3D:this.planePoolHolder3D});

	  // // need the plane facing up for other calculations later
	  const geometry = new PlaneGeometry( 10, 10 );
	  const matrix = new Matrix4().makeRotationX(-Math.PI / 2);
	  geometry.applyMatrix4(matrix);


	    
	  const material = new MeshBasicMaterial( { color: 0xff22ff, opacity:0.2, transparent : true} );
	  const plane = new Mesh( geometry, material );
	  this.ff.scene.add( plane );
	  this.hitZonePlane = plane;
	  
	  // const axesHelper = new ThickAxesHelper({ length: 5, radius: 0.035 });
	  // plane.add( axesHelper );
	  

	}


	buildVisuals(){

	    // this.faceArrow = new ThickArrowHelper(this.arrowDirectionV, this.arrowOriginV, 1.1, 0x2d7fff, 0.18, 0.1);
	    this.faceArrow = new ThickArrowHelper({
	      dir : this.arrowDirectionV, 
	      origin : this.arrowOriginV, 
	      length : 1.1, 
	      colorHex : 0x2d7fff, 
	      headLength : 0.18, 
	      headWidth : 0.1, 
	      shaftRadius : 0.035
	    });
	    this.faceArrow.visible = false;
	    this.ff.visualsObject3D.add(this.faceArrow);

	}


	refresh(hitDown){

		// this.points.push(hitDown);

		this.refreshPieceFaceNormal(hitDown);

		this.displayFacePlane(hitDown);

	}


	/*	
		stores the face normal for later stuff
		also moves the faceArrow into the face of the selected hitzone

		move to something else
		
	*/	
	refreshPieceFaceNormal(hit){

		const selectedPiece = this.ff.getSelectedPiece();
		if(!selectedPiece) return;

		// --- get world normal ---
		this.worldNormal.copy(selectedPiece.worldNormal);
		// at this point this.worldNormal is the nessesary first axis for the cross product

		if(this.useVisuals){
		  this.faceArrow.visible = true;
		  this.faceArrow.position.copy(hit.point);
		  
		  this.box1.setFromObject(hit.object);
		  this.box1.getCenter(this.centerV);
		  // project onto face using normal
		  this.centerV.addScaledVector(this.worldNormal, this.box1.getSize(this.sizeV).length() / 6);
		  this.faceCenterV.copy(this.centerV);

		  // --- position arrow at hit point ---
		  this.faceArrow.position.copy(this.centerV);
		  // --- orient arrow ---
		  this.faceArrow.setDirection(this.worldNormal);
		  
		}

	}


	displayFacePlane(hit){

		// this is already done in refreshPieceFaceNormal
		// this.worldNormal is now copied from selectedPiece.worldNormal in refreshPieceFaceNormal.

		// this.faceGridHelper.quaternion.setFromUnitVectors(this.upV, hit.normal);

		this.hitZonePlane.position.copy(hit.point);
		this.hitZonePlane.quaternion.setFromUnitVectors(this.upV, this.worldNormal);

		if(this.useVisuals){
		  this.hitZonePlane.visible = true;
		}

		// alternative using infinite math plane and its helper
		// in practice this is not a solution 
		//this.planeMath.set(this.worldNormal,-hit.point.length())
	}

}