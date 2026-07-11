import { 
	Vector2, Vector3, Raycaster, Group, PlaneGeometry,
	Matrix4, Matrix3, MeshBasicMaterial, Mesh, ArrowHelper
} from "three";

import { worldNormalFromLocal } from '../math.js';
/*
	NOT AN ENGINE
	just testing if we have world space normals
*/
export class NormalsDebugger {
	group = new Group();
	
	localNormal = new Vector3(0, 0, 1);
	// Hrrrmmmmm, maybe in the plane geo it moved the verts to get z up?
	// go with it for now

	worldNormal = new Vector3();
	worldOrigin = new Vector3();

	constructor({fingersAPI, length = 0.22, color = 0xff00ff}={}){
		this.ff = fingersAPI;
		this.length = length;
		this.color = color;

		this.group.name = "NormalsDebugger";
		this.ff?.scene?.add(this.group);

		this.build();
	}

	build(){
		const pieces = this.ff?.cube?.pieces;
		if(!pieces?.length) return;

		const cubeRoot = this.ff.cube?.core ?? this.ff.cube;
		cubeRoot?.updateMatrixWorld?.(true);

		pieces.forEach(piece => {
			piece.updateMatrixWorld?.(true);

			piece.planes?.forEach(({plane}) => {
				if(!plane) return;

				plane.updateMatrixWorld?.(true);
				plane.getWorldPosition(this.worldOrigin);

				this.worldNormal.copy(worldNormalFromLocal(plane, this.localNormal));


				const arrow = new ArrowHelper(
					this.worldNormal.clone(),
					this.worldOrigin.clone(),
					this.length,
					this.color,
					this.length * 0.45,
					this.length * 0.48,
				);
				arrow.name = "face-normal-helper";
				this.group.add(arrow);
			});
		});
	}
}

