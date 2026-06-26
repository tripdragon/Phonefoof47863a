import * as THREE from "three";


//const axes = ThickAxesHelper(5, 0.05);
//scene.add(axes);
export function ThickAxesHelper({length = 5, radius = 0.05}={}) {
  const group = new THREE.Group();

  const createAxis = (color) => {
    const geom = new THREE.CylinderGeometry(radius, radius, length, 16);
    const mat = new THREE.MeshBasicMaterial({ color });
    return new THREE.Mesh(geom, mat);
  };

  // X axis (red)
  const xAxis = createAxis(0xff0000);
  xAxis.rotation.z = -Math.PI / 2;
  xAxis.position.x = length / 2;
  group.add(xAxis);

  // Y axis (green)
  const yAxis = createAxis(0x00ff00);
  yAxis.position.y = length / 2;
  group.add(yAxis);

  // Z axis (blue)
  const zAxis = createAxis(0x0000ff);
  zAxis.rotation.x = Math.PI / 2;
  zAxis.position.z = length / 2;
  group.add(zAxis);

  return group;
}

const DEFAULT_DIRECTION = new THREE.Vector3(0, 1, 0);

export class ThickArrowHelper extends THREE.Object3D {
  constructor(dir = DEFAULT_DIRECTION, origin = new THREE.Vector3(), length = 1, color = 0xffff00, headLength = length * 0.2, headWidth = headLength * 0.6, shaftRadius = 0.035) {
    super();
    this.type = "ThickArrowHelper";

    this.shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(shaftRadius, shaftRadius, 1, 16),
      new THREE.MeshBasicMaterial({ color }),
    );
    this.shaft.position.y = 0.5;
    this.add(this.shaft);

    this.cone = new THREE.Mesh(
      new THREE.ConeGeometry(headWidth, headLength, 24),
      new THREE.MeshBasicMaterial({ color }),
    );
    this.add(this.cone);

    this.position.copy(origin);
    this.setDirection(dir);
    this.setLength(length, headLength, headWidth);
  }

  setDirection(dir) {
    const direction = dir.clone().normalize();

    if (direction.y > 0.99999) {
      this.quaternion.set(0, 0, 0, 1);
    } else if (direction.y < -0.99999) {
      this.quaternion.set(1, 0, 0, 0);
    } else {
      const axis = new THREE.Vector3(direction.z, 0, -direction.x).normalize();
      const radians = Math.acos(direction.y);
      this.quaternion.setFromAxisAngle(axis, radians);
    }
  }

  setLength(length, headLength = length * 0.2, headWidth = headLength * 0.6) {
    const shaftLength = Math.max(length - headLength, 0.000001);

    this.shaft.scale.set(1, shaftLength, 1);
    this.shaft.position.y = shaftLength / 2;

    this.cone.geometry.dispose();
    this.cone.geometry = new THREE.ConeGeometry(headWidth, headLength, 24);
    this.cone.position.y = shaftLength + headLength / 2;
  }

  setColor(color) {
    this.shaft.material.color.set(color);
    this.cone.material.color.set(color);
  }

  dispose() {
    this.shaft.geometry.dispose();
    this.shaft.material.dispose();
    this.cone.geometry.dispose();
    this.cone.material.dispose();
  }
}
