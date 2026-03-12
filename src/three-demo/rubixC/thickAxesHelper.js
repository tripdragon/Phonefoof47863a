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
