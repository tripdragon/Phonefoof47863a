
import { 
	Vector2, Vector3, Matrix4
} from "three";


const lever = new Vector3();
const inverseWorldMatrix = new Matrix4();


export class AxisModel{
	group = null;
	axis = new Vector3();

	constructor({group = null, axis}={}){
		this.group = group;
		if(axis){
			this.axis.copy(axis);
		}
	}
}


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
	axises = [];
	selectedFaceNormalLocalV = new Vector3();
	// touchesController;



	constructor({fingersAPI}={}){
		this.ff = fingersAPI;
		// this.touchesController = this.ff.touchesController;
		this.build();
	}
	build(){
		// this.buildArrow();
	}

	constructAxisesFrom(selectedPiece){
		this.axises.length = 0;
		this.refreshSelectedFaceNormalLocalDirection();

		if(!selectedPiece || !this.ff?.cube?.tGS){
			return this.axises;
		}

		Object.values(this.ff.cube.tGS).forEach((group) => {
			if(!group?.includes?.(selectedPiece)){
				return;
			}

			const axisModel = new AxisModel({group});
			const centerPiece = group?.center;

			if(centerPiece?.getWorldPosition){
				centerPiece.getWorldPosition(axisModel.axis);
			}

			this.axises.push(axisModel);
		});

		return this.axises;
	}

	refreshSelectedFaceNormalLocalDirection(){
		const localSpace = this.ff?.cube?.core ?? this.ff?.cube;
		const worldNormal = this.ff?.touchesController?.engines?.magicPlane?.worldNormal;

		this.selectedFaceNormalLocalV.set(0, 0, 0);

		if(!localSpace || !worldNormal){
			return this.selectedFaceNormalLocalV;
		}

		localSpace.updateMatrixWorld?.(true);
		inverseWorldMatrix.copy(localSpace.matrixWorld).invert();
		lever.copy(worldNormal).transformDirection(inverseWorldMatrix).normalize();
		this.selectedFaceNormalLocalV.copy(lever);

		return this.selectedFaceNormalLocalV;
	}





	// console.log(nearlyEqual(0.1 + 0.2, 0.3)); // true
}
