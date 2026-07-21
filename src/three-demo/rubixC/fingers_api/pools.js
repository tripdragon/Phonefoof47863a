
import { Group, SphereGeometry, MeshBasicMaterial, Mesh } from "three";
import { SlightlyPriceyPool } from '../slightlyPriceyPool.js';

/*

	Ideally pools are just a debugger tool
	with meshes, and you dont rely on them for vector logic
*/

export class Pools{

	ff;

	cube = null;
	plane = null;

	constructor({fingersAPI, cubePointsMax = 40, planePointsMax = 40}={}){
		this.ff = fingersAPI;
		this.cube = new MeshPool({fingersAPI:this.ff, max:cubePointsMax, color:0xffff22, autoBuild:true});
		this.plane = new MeshPool({fingersAPI:this.ff, max:planePointsMax, color:0x0000ff, autoBuild:true});

		// this.buildCubePool();
	}

	// build(){
	// 	this.buildCubePool();
	// }
}


class MeshPool{

	ff;

	max = 20;
	holder3D = null;
	meshes = []; // SlightlyPriceyPool
	color = 0xffff22;


	constructor({fingersAPI, max = 20, autoBuild = true, color = 0xffff22}={}){
		this.ff = fingersAPI;
		this.max = max;
		this.color = color;

		if(autoBuild){
			this.build();
		}
	}


	build(){

		if (!this.ff.scene) return;

		this.holder3D = new Group();
		this.ff.visualsObject3D.add(this.holder3D);

		// this.cube.points = new SlightlyPriceyPool({rootObject3D:this.cube.holder3D});
		this.meshes = new SlightlyPriceyPool({rootObject3D:this.holder3D});


		const markerGeo = new SphereGeometry(0.09, 8, 8);
		const markerMat = new MeshBasicMaterial({ color:  this.color });

		for (let i = 0; i < this.max; i++) {
		  const marker = new Mesh(markerGeo, markerMat);
		  marker.visible = false;
		  this.meshes.add(marker);
		  this.holder3D.add(marker);
		  
		}



	}
  
}