import * as THREE from "three";

export const VISUAL_CENTER_COLOR = 0xffff00;

/** A small, unlit marker that makes a piece's transform origin visible. */
export class PieceVisualCenter extends THREE.Mesh {
  constructor({ radius = 0.2, color = VISUAL_CENTER_COLOR } = {}) {
    const geometry = new THREE.SphereGeometry(radius, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color });
    super(geometry, material);

    this.name = "PieceVisualCenter";
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
