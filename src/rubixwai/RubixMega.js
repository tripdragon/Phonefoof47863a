import * as THREE from "three";

const FACE_COLORS = Object.freeze({
  right: 0xb71234,
  left: 0xff5800,
  top: 0xffffff,
  bottom: 0xffd500,
  front: 0x009b48,
  back: 0x0046ad,
});

/** A display cube whose material order follows the six BoxGeometry faces. */
export class RubixMega extends THREE.Object3D {
  constructor({ size = 2.4 } = {}) {
    super();
    this.name = "RubixMega";

    this.geometry = new THREE.BoxGeometry(size, size, size);
    this.materials = Object.values(FACE_COLORS).map(
      (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.02 }),
    );
    this.cube = new THREE.Mesh(this.geometry, this.materials);
    this.cube.name = "RubixMegaCube";
    this.add(this.cube);
  }

  dispose() {
    this.geometry.dispose();
    this.materials.forEach((material) => material.dispose());
  }
}

export { FACE_COLORS };
