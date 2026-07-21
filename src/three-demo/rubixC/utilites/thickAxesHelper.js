
/*
  These two should be seperate files
*/
// import * as THREE from "three";


import { 
  CylinderGeometry, ConeGeometry,
  Vector2, Vector3, Raycaster, Group, PlaneGeometry,
  Matrix4, MeshBasicMaterial, Mesh, Box3, Object3D
} from "three";



//const axes = ThickAxesHelper(5, 0.05);
//scene.add(axes);


export class ThickAxesHelper extends Group {

  isType = "ThickAxesHelper";


  constructor({length = 5, radius = 0.05}={}){
    super();

    this.radius = radius;
    this.length = length;

    // X axis (red)
    const xAxis = this.createAxis(0xff0000, radius, length);
    xAxis.rotation.z = -Math.PI / 2;
    xAxis.position.x = length / 2;
    this.add(xAxis);

    // Y axis (green)
    const yAxis = this.createAxis(0x00ff00, radius, length);
    yAxis.position.y = length / 2;
    this.add(yAxis);

    // Z axis (blue)
    const zAxis = this.createAxis(0x0000ff, radius, length);
    zAxis.rotation.x = Math.PI / 2;
    zAxis.position.z = length / 2;
    this.add(zAxis);


  }

  createAxis(color, radius, length) {
    const geom = new CylinderGeometry(radius, radius, length, 16);
    const mat = new MeshBasicMaterial({ color });
    return new Mesh(geom, mat);
  }



  
}
