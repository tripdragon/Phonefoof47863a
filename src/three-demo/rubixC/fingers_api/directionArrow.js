
import { ThickArrowHelper, ThickAxesHelper } from "../thickAxesHelper.js";

import { 
	Vector2, Vector3
} from "three";


export class DirectionArrow{

	ff;

	arrows = {
		average : {
			visual: null,
			dirV : new Vector3(),
			originV : new Vector3(),
			movingAverageV : new Vector3()
		},
		absolute : {
			visual: null,
			dirV : new Vector3(),
			originV : new Vector3(),
			movingAverageV : new Vector3(),
			units : [new Vector3(), new Vector3(), new Vector3(), new Vector3()],
			nearest: [],
			workV: new Vector3()
		}

	}

	workV = new Vector3();
	startV = new Vector3();

	// arrowDirHelper;
	// arrowDirV = new Vector3();
	// arrowDirOriginV = new Vector3();

	// movingAveragePointV = new Vector3();
	// pointDown3D = new Vector3();

	currentDragDistance = 0;

	// EPSILONish = 1e-6;
	EPSILONish = 0.000001;

	showDirectionArrow = true;

	// wicked bug, arrow and thus dir can be into space when slow or flick fast
	waitLimToUpdateAveDir = 3;

	constructor({fingersAPI}={}){
		this.ff = fingersAPI;
		this.build();
	}


	build(){
		const aa = this.arrows.average;
		// this.arrowDirHelper = new ThickArrowHelper(this.arrowDirV, this.arrowDirOriginV, 5.1, 0xffffff, 0.18, 0.1);
		aa.visual = new ThickArrowHelper(aa.dirV, aa.originV, 4.1, 0xffffff, 0.18, 0.1);
		//this.arrowDirHelper.visible = false;
		this.ff.visualsObject3D.add(aa.visual);

		const a2 = this.arrows.absolute;
		// this.arrowDirHelper = new ThickArrowHelper(this.arrowDirV, this.arrowDirOriginV, 5.1, 0xffffff, 0.18, 0.1);
		a2.visual = new ThickArrowHelper(a2.dirV, a2.originV, 1.1, 0xffc702, 0.18, 0.1);
		//this.arrowDirHelper.visible = false;
		this.ff.visualsObject3D.add(a2.visual);

		
	}


	reset(){
		const aa = this.arrows.average;
		aa.movingAverageV.set(0,0,0);
		aa.originV.set(0,0,0);
		aa.dirV.set(0,0,0);
	}

	refresh(){

		const aa = this.arrows.average;
		const a2 = this.arrows.absolute;

		// this.arrowDirOriginV.copy(this.pointsPlane[0].point);
		const planePoints = this.ff.getPlanePoints();
		// const cubePoints = this.ff.getCubePoints();
		
		if(planePoints.length > this.waitLimToUpdateAveDir){
			
			// this.arrowDirOriginV.copy(cubePoints[0].point);
			aa.originV.copy(this.ff.getPointDown());

			aa.dirV.set(0, 0, 1);
			aa.visual.position.copy(aa.originV);
			aa.visual.setDirection(aa.dirV);
			if (this.showDirectionArrow) {
			  aa.visual.visible = true;
			}



			a2.originV.copy(this.ff.getPointDown());

			a2.dirV.set(0, 0, 1);
			a2.visual.position.copy(a2.originV);
			a2.visual.setDirection(a2.dirV);
			if (this.showDirectionArrow) {
			  a2.visual.visible = true;
			}

			// this.updateClampedDirectionHelper();
			// this.updateCrossProductHelper();

			this.updateDirectionCheck();
		}
	}


	/*

	*/
	  // pv0 = new Vector3();
	  // pv1 = new Vector3();
	  // pv2 = new Vector3();


	  // has_dihffg = false;
	  // ballA = null;
	  // ballB = null;
	  // matrixA = new Matrix3();
	  // boxaA1 = null;
	  // Vsdhjkf111 = new Vector3();

	updateDirectionCheck(ev){
		// if(!this.has_dihffg){
		//   this.has_dihffg = true;
		//   const ballGeoA = new SphereGeometry(0.1, 8, 8);
		//   const markerMat = new MeshBasicMaterial({ color: 0xffbb22 });
		//   const markerMat2 = new MeshBasicMaterial({ color: 0xaa22ff });
		//   this.ballA = new Mesh(ballGeoA, markerMat);
		//   this.ballB = new Mesh(ballGeoA, markerMat2);
		//   this.scene.add(this.ballA);
		//   this.scene.add(this.ballB);

		//   const aa = 0.2;
		//   const c1 = new BoxGeometry( aa,aa,aa );
		//   const markerMat2sdf = new MeshBasicMaterial({ color: 0xaa22ff });
		//   this.boxaA1 = new Mesh(c1, markerMat2sdf);
		//   this.scene.add(this.boxaA1);

		// }
		// this was AI, its job isa to get the average
		// of the points to get the direction on the plane
		// then over a threshold, activate the next states

		const aa = this.arrows.average;
		const a2 = this.arrows.absolute;

		const planePoints = this.ff.getPlanePoints();

		if(planePoints.length < this.waitLimToUpdateAveDir){
			this.arrowDirHelper.visible = false;
			return;
		}
		// this.getAveragePointFromHits(this.pointsPlane, this.movingAveragePointV);
		// this.getAveragePointFromHits(this.ff.touchesController.session.points.plane, this.movingAveragePointV);
		this.getAveragePointFromHits(planePoints, aa.movingAverageV);

		// const first = planePoints[0].point;
		const first = this.ff.getPointDown();
		const recent = planePoints[planePoints.length-1].point;
		// this.currentDragDistance = this.pointDown3D.distanceTo(this.hitsPlane[0].point);
		this.currentDragDistance = first.distanceTo(recent);

						// this.updateDistanceHud(this.currentDragDistance);
						// if (this.currentDragDistance >= this.triggerDistance && this.lastTriggeredDistance < this.triggerDistance) {
						//   this.lastTriggeredDistance = this.currentDragDistance;
						//   this.popThresholdBubble(this.currentDragDistance);
						// }

		// aa.dirV.copy(aa.movingAverageV).sub(aa.originV);
		aa.dirV.copy(aa.movingAverageV);
		const dirLen = aa.dirV.length();
		if (dirLen > this.EPSILONish) {
		  aa.dirV.multiplyScalar(1 / dirLen);
		  aa.visual.position.copy(aa.originV);
		  aa.visual.setDirection(aa.dirV);
		  aa.visual.visible = true;
						  // this.updateClampedDirectionFromSelectedScreenAxises();
						  // this.updateCrossProductHelper();
		}




// a2.dirV.copy(a2.movingAverageV).sub(a2.originV);
		if (dirLen > this.EPSILONish) {
		  // a2.dirV.multiplyScalar(1 / dirLen);
		  a2.visual.position.copy(aa.originV);
		  // a2.visual.setDirection(aa.dirV);
		  
		  const vv = this.getAbsoluteDir(aa.dirV);

		  a2.visual.setDirection(vv);
		  a2.visual.visible = true;
						  // this.updateClampedDirectionFromSelectedScreenAxises();
						  // this.updateCrossProductHelper();
		}





					// // // ok from here we need to atan2 in local space
					// // // then test north east etc...
					// this.pv0.copy(this.arrowDirOriginV);
					// this.pv1.copy(this.arrowDirV).add(this.arrowDirOriginV);
					// this.planeHitZone3D.updateMatrix();
					// this.ballA.position.copy(this.pv0);
					// this.ballB.position.copy(this.pv1);
					// this.planeHitZone3D.worldToLocal(this.pv0);
					// this.planeHitZone3D.worldToLocal(this.pv1);
					// this.pv2.copy(this.pv1).sub(this.pv0);

					// this.Vsdhjkf111.set(0,1,0);
					// this.Vsdhjkf111.set(2,0,0);
					// this.planeHitZone3D.localToWorld(this.Vsdhjkf111);
					// // plane y is up or its face!!
					// this.boxaA1.position.copy(this.Vsdhjkf111);


					// console.log(this.pv2);



	}

	/*
	hits: [THREE.Point]
	*/

	// this is wrong, its not localizing the points
	// they start in world and thus the first is 0 to world
	getAveragePointFromHits(hits, output){
		// window.hh = hits;
		output.set(0, 0, 0);
		if(hits.length === 0) return output;
		// hits.forEach(x => {
		//   output.add(x.point);
		// });
		this.startV.copy(hits[0].point)
		for (var i = 1; i < hits.length; i++) {
			this.workV.copy(hits[i].point).sub(this.startV);
			output.add(this.workV);
		}
		output.divideScalar(hits.length);
		return output;
	}

	nearlyEqual(a, b) {
	  return Math.abs(a - b) < EPSILON;
	}



	getAbsoluteDir(dirIn){

		const a2 = this.arrows.absolute;
		
		a2.nearest = Object.entries(dirIn).reduce((a, b) =>
		  Math.abs(b[1]) < Math.abs(a[1]) ? b : a
		);

		const [key, value] = a2.nearest;
		// const units = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];

		const units = a2.units;
		// its NOT the prop, to the values are absolute n,e,s,w
		if (key === "x") {
			units[0].set(0,1,0);
			units[1].set(0,-1,0);
			units[2].set(0,0,1);
			units[3].set(0,0,-1);
		}
		else if (key === "y") {
			units[0].set(1,0,0);
			units[1].set(-1,0,0);
			units[2].set(0,0,1);
			units[3].set(0,0,-1);
		}
		else if (key === "z") {
			units[0].set(1,0,0);
			units[1].set(-1,0,0);
			units[2].set(0,1,0);
			units[3].set(0,-1,0);
		}

		a2.workV.copy(dirIn).normalize();

		let val = a2.workV.dot(units[0]);
		let pick = 0;
		for (var i = 1; i < units.length; i++) {
			const yy = a2.workV.dot(units[i]);
			if(val < yy){
				val = yy;
				pick = i;
			}
		}

		return units[pick];

	}


}

	