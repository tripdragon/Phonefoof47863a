import * as THREE from "three";

export class DebugSelectionDownLine extends THREE.Object3D {
  constructor({ length = 1.2, radius = 0.028, color = 0x000000 } = {}) {
    super();

    this.length = length;
    this.localDown = new THREE.Vector3(0, -1, 0);
    this.worldDown = new THREE.Vector3(0, -1, 0);
    this.origin = new THREE.Vector3();
    this.quaternionTarget = new THREE.Quaternion();
    this.downAxis = new THREE.Vector3(0, -1, 0);

    const geometry = new THREE.CylinderGeometry(radius, radius, length, 14, 1, false);
    const material = new THREE.MeshBasicMaterial({ color });

    this.lineMesh = new THREE.Mesh(geometry, material);
    // Cylinders are Y-aligned and centered by default; move so top touches object origin.
    this.lineMesh.position.y = -length * 0.5;
    this.add(this.lineMesh);

    this.visible = false;
  }

  syncFromSelection(piece) {
    if (!piece) {
      this.visible = false;
      return;
    }

    piece.getWorldPosition(this.origin);
    this.position.copy(this.origin);

    this.worldDown
      .copy(this.localDown)
      .transformDirection(piece.matrixWorld)
      .normalize();

    this.quaternionTarget.setFromUnitVectors(this.downAxis, this.worldDown);
    this.quaternion.copy(this.quaternionTarget);

    this.visible = true;
  }
}
