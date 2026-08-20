import * as THREE from "three";

const NORMAL_COLOR = 0x0ea5e9;

/** A disposable debug overlay that draws the outward normal of every Piece face. */
export class PieceNormalsDebugger extends THREE.Object3D {
  constructor(piece, { color = NORMAL_COLOR, length } = {}) {
    super();
    if (!piece?.isGroup || !piece?.faces) {
      throw new TypeError("PieceNormalsDebugger requires a Piece");
    }

    this.name = `${piece.name}-face-normals`;
    this.visible = false;
    this.arrows = [];

    const size = piece.size;
    const arrowLength = length ?? size * 0.28;
    const headLength = Math.min(arrowLength * 0.35, size * 0.12);
    const headWidth = headLength * 0.55;

    for (const face of Object.values(piece.faces)) {
      const normal = new THREE.Vector3();
      normal[face.axis] = face.sign;
      const origin = normal.clone().multiplyScalar(size / 2 + size * 0.015);
      const arrow = new THREE.ArrowHelper(
        normal,
        origin,
        arrowLength,
        color,
        headLength,
        headWidth,
      );
      arrow.name = `${face.faceName}-normal`;
      arrow.userData.face = face.faceName;
      this.arrows.push(arrow);
      this.add(arrow);
    }

    piece.add(this);
  }

  dispose() {
    this.removeFromParent();
    for (const arrow of this.arrows) {
      arrow.line.geometry.dispose();
      arrow.line.material.dispose();
      arrow.cone.geometry.dispose();
      arrow.cone.material.dispose();
    }
  }
}

export { NORMAL_COLOR };
