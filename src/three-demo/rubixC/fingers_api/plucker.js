
import { 
	Vector2, Vector3
} from "three";

import { worldNormalFromLocal } from "../math.js";

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

	buckets = new Bucket();

	worldNormal = new Vector3();
	// localNormal = new Vector3();


	constructor({fingersAPI}={}){
		this.ff = fingersAPI;
		// this.touchesController = this.ff.touchesController;
		this.build();
	}
	build(){
		// this.buildArrow();
	}


	// hitDown : THREE.Hit object
	refreshAxises(hitDown){
		// const piece = this.ff.getSelectedPiece();

		if(hitDown?.object){
			hitDown.object.updateMatrixWorld();
			this.worldNormal.copy(worldNormalFromLocal(hitDown.object,hitDown.normal));
			// console.log("this.worldNormal", this.worldNormal);
		}
		
		
	}

	pluck(hit, piece){
	/*
		++ From selected piece
			To keep routines clean we work from array 3's
			So computing will padden when we need to get Axis's
		++ Get the groups that piece is shared within
		
		++ Each group now already has a normalized axis, easy peasy .axis


		-- obsolete
		-- Axis's: From the groups, we need the .center to produce a normalized
			Axis, 
			Side piece has no issues
			Edge piece will have one in the array .center = null
			Center piece has two since two are rings
		++2
			
	*/

		this.refreshAxises(hit);
		// console.log("sdfklmdf")
		

		// this.buckets.groups = this.ff.cube.getSelectedPieceGroups(piece);
		// const groups = this.buckets.groups;
		const groups = this.ff.cube.getSelectedPieceGroups(piece);



		/*
			what is plucker even for now??

			ah, its just to pick to main working group since we dont need to
			calculate axises now


		*/


		groups.forEach(g=>{
			console.log("gg",g.axis);
			// need direction arrow absolute here
			// need torque lever from selected face normal here
			// const cc = hit.normal.clone()
			// const lever = object.localToWorld( cc );
		});






		// this.buckets.refresh(groups);



		console.log("groups", groups)
		window.groups = groups;

		const centers = groups.map(x=>x.center);
		
		window.centers = centers;
		console.log("centers", centers);

		// centers[0].whichType

		const axises = [];
		// ???
		// selected

		this.ff.cube.colorAllPieces(0xffffff);

		let ii = 0;
		const cc = [0xff0000,0x00ff00,0x0000ff];
		groups.forEach(x=>{
			x.forEach(yy=>{
				yy.setColorOverAll(cc[ii]);
			})
			ii++;
		})
		
		worldNormalFromLocal(hit.object, hit.normal);

		// this.ff.cube.colorAllPieces(0xffffff);

		// center here is null for ring types
		centers.forEach((x, index) => {
			if(x?.setColorOverAll){

				x.setColorOverAll(0x111111)
			}
		});

	}




	// console.log(nearlyEqual(0.1 + 0.2, 0.3)); // true
}



class Bucket {

	index = 0;
	groups = [];
	axises = [new Vector3(), new Vector3(), new Vector3()];
	a3 = [];
	a4 = [];

	wV = new Vector3();
	wA = [];

	centers = [];
	centers_F = [];

	constructor(){}
	clear(){
		this.index = 0;
		this.groups.length = 0;
		this.axises.forEach(x=>{x.set(0,0,0)});
		this.a3.length = 0;
		this.a4.length = 0;
	}
	refresh(groups){
		this.groups = groups;

		// this.buildAxises_A();
		this.buildAxises_B();

		
	}


	buildAxises_B(){
	/*
		Instead of computing just agree that there IS a localized space
		that of the cube, and its PieceGroups follow that axis
		so we can always state the "center" being a "ring(s)" will have an axis

	*/

		const groups = this.groups;


	}

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