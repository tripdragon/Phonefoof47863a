

/*
	Session
	Built every first touch down
	Or just .reset() save some objects mem
	ignore if multi touch FOR NOW.... hrmmmm
*/
export class Session{

	points = {
		screen : [], // vector2
		cube : [], // THREE.Point ?
		plane : [], // ???¿¿, also THREE.Point
		// this one is just to prevent flooding arrays into memory
		// from raycaster, only need [0] from it typically
		cubeRayHits : [], // THREE.Point
		planeRayHits : []
	}

	constructor(){}

	reset(){
		this.points.screen.length = 0;
		this.points.plane.length = 0;
		this.points.cube.length = 0;
		this.points.cubeRayHits.length = 0;
		this.points.planeRayHits.length = 0;
	}

}
