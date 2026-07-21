
import { 
	Vector2, Vector3, Matrix4, Quaternion
} from "three";

  
import { worldNormalFromLocal } from "../math.js";
import { ThickArrowHelper } from "../utilites/thickArrowHelper.js";

/*
	
	this one has tons of steps
	which requires lots of debugger visuals

	taking a line thats in 3d space but in a 2d form over 2 axis

	+ derive an average direction from points session
	+ figure out which axis's to drive the next
		++ derive a clammped direction to n,e,s,w 
		++ derive a torque from the clamped direction as force
	+ check force against the axises



	
*/
export class Plucker{
	ff;
	// touchesController;

	// buckets = new Bucket();

	// used as a lever as well but no length for now
	// faceNormal = new Vector3();
	
	// localNormal = new Vector3();

	visuals = {
		torqueArrow : null
	}

	plucked = {
		group : null,
		leverV : new Vector3(),
		index : -1,
		force: new Vector3()
	}

	constructor({fingersAPI}={}){
		this.ff = fingersAPI;
		// this.touchesController = this.ff.touchesController;
		this.build();

		// this.visuals.torqueArrow = new ThickArrowHelper(aa.dirV, new Vector3(), 4.1, 0xffffff, 0.18, 0.1);
		this.visuals.torqueArrow = new ThickArrowHelper({
	      dir : new Vector3(0,1,0), 
	      origin : new Vector3(), 
	      length : 5.1, 
	      colorHex : 0x2fafff, 
	      headLength : 0.18, 
	      headWidth : 0.1, 
	      shaftRadius : 0.035
	    });
		//this.arrowDirHelper.visible = false;
		this.ff.visualsObject3D.add(this.visuals.torqueArrow);

	}

	
	build(){
		// this.buildArrow();
	}


	onDown(hit, piece){
		/*
			touchesController runs this from its first touch down
		*/
		this.plucked.group = null;
		this.groups = this.ff.cube.getSelectedPieceGroups(piece);

		// this.faceNormal.copy(hit.object.localToWorld(hit.normal));
		// this.faceNormal.copy(hit.object.localToWorld(hit.normal));

	}

	onUp(){
		
	}

	// hitDown : THREE.Hit object
	// refreshAxises(hitDown){
	// 	// const piece = this.ff.getSelectedPiece();

	// 	if(hitDown?.object){
	// 		hitDown.object.updateMatrixWorld();
	// 		// this.worldNormal.copy(worldNormalFromLocal(hitDown.object,hitDown.normal));
	// 		// console.log("this.worldNormal", this.worldNormal);
	// 	}
		
		
	// }

// leverV = new Vector3();

	tally = [];


	// livePluck(hit,piece,direction){
	pluck(hit,piece,direction){
	
	/*
		hit : three.hit from raycast or object with .normal, .object ...
		piece : Piece Object
		direction : Vector3
	*/

		// console.log("direction", direction);
	// leverV.copy(hit.normal);
	// hit.object.localToWorld(leverV);

		if(this.groups.length < 3){
			debugger
		}


		const selected = this.ff.getSelectedPiece();

		if(!selected){
			console.warn("selected piece missing!!");
			return;
		}

		const lever = selected.worldNormal;

		let tally = this.tally;
		tally.length = 0;
		let ii = 0;
		this.groups.forEach(gg=>{
			
			const results = this.measureTorqueOnPiece({
				group:gg,
				// leverV:this.faceNormal,
				leverV:lever,
				forceV:direction
			});
			const dot = results.dot;
			const angle = results.angle;
			// tally.push(dot);
			tally.push(angle);
			ii++;
		});
		// let ig = 0;
		// // let _dot = tally[0];
		// for (let i = 1; i < tally.length-1; i++) {
		// 	if(tally[i+1] < tally[i]){
		// 		ig = i;
		// 	}
		// }


		// let tally = [2, 0.1, 19];
		let ig = 0;
		for (let i = 1; i < tally.length; i++) {
			if(tally[i] < tally[ig]){
				ig = i;
			}
		}
		// console.log("ig", ig, tally);

		this.plucked.group = this.groups[ig];
		this.plucked.index = ig;
		this.plucked.leverV.copy(lever);
		this.plucked.force.copy(direction);

		return this.plucked;


	}






  m = new Matrix4();
  t = new Vector3();
  q = new Quaternion()
  s = new Vector3(1, 1, 1);

  torqueV = new Vector3();

  axisV = new Vector3();

  measureResults = {dot:0,angle:0}

  // > int
  measureTorqueOnPiece({group,leverV,forceV}){
    /*
      this does not visually turn anything, its role is to give back a
      vector and an angle dot product to know if an axis should have been locked to
      an axis spin
    */

    // all the same as torqueGroup
    const t = this.t;
    const tq = this.torqueV;
    const q = this.q;
    const s = this.s;
    const m = this.m;
    // const yy = this.ff.cube.getPiecesGroup(name);
    // const yy = this.groups;
    const axisW = this.axisV;

    axisW.copy(group.axis);

    // might need to ABS the lever and axis here
    // just to get a reading not a heading
    // also where is lever length???
    // this does not read as proper torque yet

    tq.crossVectors(forceV,leverV);
    const deltaAngle = tq.length();
    q.setFromAxisAngle(tq.normalize(), deltaAngle);
    axisW.applyQuaternion(q);

    // need dot product
    const dot = group.axis.dot(axisW);
    const angle = group.axis.angleTo(axisW);
    
    // return dot;
    this.measureResults.dot = dot;
    this.measureResults.angle = angle;
    return this.measureResults;
    
  }





//   /*
// 		depricated like
//   */


// 	pluck(hit, piece){
		

// 		return;



// 	/*
// 		++ From selected piece
// 			To keep routines clean we work from array 3's
// 			So computing will padden when we need to get Axis's
// 		++ Get the groups that piece is shared within
		
// 		++ Each group now already has a normalized axis, easy peasy .axis


// 		-- obsolete
// 		-- Axis's: From the groups, we need the .center to produce a normalized
// 			Axis, 
// 			Side piece has no issues
// 			Edge piece will have one in the array .center = null
// 			Center piece has two since two are rings
// 		++2
			
// 	*/

// 		this.refreshAxises(hit);
// 		// console.log("sdfklmdf")
		

// 		// this.buckets.groups = this.ff.cube.getSelectedPieceGroups(piece);
// 		// const groups = this.buckets.groups;
// 		const groups = this.ff.cube.getSelectedPieceGroups(piece);



// 		/*
// 			what is plucker even for now??

// 			ah, its just to pick to main working group since we dont need to
// 			calculate axises now


// 		*/


// 		groups.forEach(g=>{
// 			console.log("gg",g.axis);
// 			// need direction arrow absolute here
// 			// need torque lever from selected face normal here
// 			// const cc = hit.normal.clone()
// 			// const lever = object.localToWorld( cc );
// 		});






// 		// this.buckets.refresh(groups);



// 		console.log("groups", groups)
// 		window.groups = groups;

// 		const centers = groups.map(x=>x.center);
		
// 		window.centers = centers;
// 		console.log("centers", centers);

// 		// centers[0].whichType

// 		const axises = [];
// 		// ???
// 		// selected

// 		this.ff.cube.colorAllPieces(0xffffff);

// 		let ii = 0;
// 		const cc = [0xff0000,0x00ff00,0x0000ff];
// 		groups.forEach(x=>{
// 			x.forEach(yy=>{
// 				yy.setColorOverAll(cc[ii]);
// 			})
// 			ii++;
// 		})
		
// 		worldNormalFromLocal(hit.object, hit.normal);

// 		// this.ff.cube.colorAllPieces(0xffffff);

// 		// center here is null for ring types
// 		centers.forEach((x, index) => {
// 			if(x?.setColorOverAll){

// 				x.setColorOverAll(0x111111)
// 			}
// 		});

// 	}




// 	// console.log(nearlyEqual(0.1 + 0.2, 0.3)); // true
// }



// class Bucket {

// 	index = 0;
// 	groups = [];
// 	axises = [new Vector3(), new Vector3(), new Vector3()];
// 	a3 = [];
// 	a4 = [];

// 	wV = new Vector3();
// 	wA = [];

// 	centers = [];
// 	centers_F = [];

// 	constructor(){}
// 	clear(){
// 		this.index = 0;
// 		this.groups.length = 0;
// 		this.axises.forEach(x=>{x.set(0,0,0)});
// 		this.a3.length = 0;
// 		this.a4.length = 0;
// 	}
// 	refresh(groups){
// 		this.groups = groups;

// 		// this.buildAxises_A();
// 		this.buildAxises_B();

		
// 	}


// 	buildAxises_B(){
// 	/*
// 		Instead of computing just agree that there IS a localized space
// 		that of the cube, and its PieceGroups follow that axis
// 		so we can always state the "center" being a "ring(s)" will have an axis

// 	*/

// 		const groups = this.groups;


// 	}

	/*

		obsolete maybe"
		Build eaiser with cached axises
	*/
	// buildAxises_A(){
	// 	const groups = this.groups;

	// 	// 
	// 	this.centers = groups.map(x=>x.center);
	// 	this.centers_F = this.centers.filter(x=>x!==null);
		
	// 	const centers = this.centers;
	// 	const centers_F = this.centers_F;
	// 	const axises = this.axises;

	// 	// debugger
	// 	// const gc = Object.values(groups).filter((group) => group?.includes?.(center));
	// 	window.gc = centers;

	// 	if (centers_F.length === 3) {
	// 		for (let i = 0; i < groups.length; i++) {
	// 			this.axises[i].copy(groups[i].center).normalize();
	// 		}
	// 	}

	// 	// from here we need to derive missing axis's
	// 	// however its from an edge piece, thus its missing
	// 	// X axis is neither signed nor not
	// 	// so whats the point of this exersize?
	// 	// hmmmm
	// 	else if (centers_F.length === 2) {
	// 		// add vectors to find the 0 
	// 		this.wV.set(0,0,0);
	// 		centers.forEach(x=>{
	// 			if(x !== null){
	// 				this.wV.add(centers[0].position);
	// 			}
	// 		});
	// 		centers.forEach(x=>{
	// 			if(g === null){
	// 				if(Math.abs(this.wV.x) >= 1 && Math.abs(this.wV.y) >= 1){
	// 					g.set(0,0,1);
	// 				}
	// 				else if(Math.abs(this.wV.y) >= 1 && Math.abs(this.wV.z) >= 1){
	// 					g.set(1,0,0);
	// 				}
	// 				else if(Math.abs(this.wV.x) >= 1 && Math.abs(this.wV.z) >= 1){
	// 					g.set(0,1,0);
	// 				}
	// 			}
	// 		});
			
			
	// 	}

	// 	// this.wA = Object.keys();
	// 	// for (let i = 0; i < groups.length; i++) {
	// 	// 	if(groups[i].center !== null){
	// 	// 		this.axises[i].copy(groups[i].center).normalize();
	// 	// 	}
	// 	// 	// here we have to compute the missing axis
	// 	// 	else if(groups[i].center === null){

	// 	// 	}
	// 	// }
	// }
}