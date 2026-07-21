
import { 
	CylinderGeometry, ConeGeometry, Color,
	Vector2, Vector3, Raycaster, Group, PlaneGeometry,
	Matrix4, MeshBasicMaterial, Mesh, Box3, Object3D
} from "three";


export class ThickArrowHelper extends Object3D {
  
  isType = "ThickArrowHelper";
  direction = new Vector3(0,1,0);

  axisV = new Vector3();

  color = new Color();

  constructor({
      dir = new Vector3(0,1,0), 
      origin = new Vector3(), 
      length = 1, 
      colorHex = 0xffff00, 
      headLength = 0.2, 
      headWidth = 0.6, 
      shaftRadius = 0.035
    }={}) {
    
    super();

    this.headLength = headLength;
    this.headWidth = headWidth;
    this.shaftRadius = shaftRadius;
    this.color.setHex(colorHex);


    this.shaft = new Mesh(
      new CylinderGeometry(shaftRadius, shaftRadius, 1, 16),
      new MeshBasicMaterial({ color:colorHex }),
    );
    this.shaft.position.y = 0.5;
    this.add(this.shaft);

    this.cone = new Mesh(
      new ConeGeometry(headWidth, headLength, 24),
      new MeshBasicMaterial({ color:colorHex }),
    );
    this.add(this.cone);

    this.position.copy(origin);
    this.setDirection(dir);
    this.setLength({length, headLength, headWidth});
  }

  refresh(dir){

  }

  setDirection(dir) {
    const direction = this.direction.copy(dir).normalize();

    if (direction.y > 0.99999) {
      this.quaternion.set(0, 0, 0, 1);
    } else if (direction.y < -0.99999) {
      this.quaternion.set(1, 0, 0, 0);
    } else {
      const axis = this.axisV.set(direction.z, 0, -direction.x).normalize();
      const radians = Math.acos(direction.y);
      this.quaternion.setFromAxisAngle(axis, radians);
    }
  }

  // setLength({length, headLength = length * 0.2, headWidth = headLength * 0.6}={}) {
  setLength({length}={}) {
    const shaftLength = Math.max(length - this.headLength, 0.000001);

    this.shaft.scale.set(1, shaftLength, 1);
    this.shaft.position.y = shaftLength / 2;

    // WHY on earth was ai even doing this??!??!?!
    // the head would not change from a dir swap
    // EXPENSSIVE, need to instead just scale
    // cause resizing the geo buffer is the same exspennsive process
    // this.cone.geometry.dispose();
    // this.cone.geometry = new ConeGeometry(headWidth, headLength, 24);
    
    this.cone.position.y = shaftLength + this.headLength / 2;
  }

  // setColor(color) {
  //   this.shaft.material.color.set(color);
  //   this.cone.material.color.set(color);
  // }

  dispose() {
    this.shaft.geometry.dispose();
    this.shaft.material.dispose();
    this.cone.geometry.dispose();
    this.cone.material.dispose();
  }
}
