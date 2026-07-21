import { 
	Vector2, Vector3,
	Matrix4, Matrix3
} from "three";

import { worldNormalFromLocal } from '../math.js';

export class SelectedPiece {
	hit;
	// normalMatrix = new Matrix3();
	worldNormal = new Vector3();

	

	constructor(hit){
		this.hit = hit;

		if(this.hit?.object){
			this.worldNormal.copy(worldNormalFromLocal(this.hit.object, this.hit.normal));
			//// this.worldNormal.copy(this.hit.object.localToWorld(hit.normal));
			//// this.worldNormal.copy(this.hit.object.localToWorld(this.hit.face.normal));
		}
	}

	get piece(){
		return this.hit?.object?.parent?.isPiece ? this.hit.object.parent : null;
	}

	get position(){
		return this.hit?.point ?? null;
	}

	get face(){
		return this.hit?.face ?? null;
	}
}
