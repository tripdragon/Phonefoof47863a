
import { 
	Vector2, Vector3
} from "three";


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



	constructor({fingersAPI}={}){
		this.ff = fingersAPI;
		// this.touchesController = this.ff.touchesController;
		this.build();
	}
	build(){
		// this.buildArrow();
	}





	// console.log(nearlyEqual(0.1 + 0.2, 0.3)); // true
}

