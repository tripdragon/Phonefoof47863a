import * as THREE from "three";
import { Piece, PIECE_TYPES } from "./Piece.js";
import { DEFAULT_RUBIX_THEME, RUBIX_THEMES } from "./themes.js";

/** The Rubik's-cube model and owner of its pieces. */
export class RubixMega extends THREE.Object3D {
  constructor({ size = 2.4, spacing = 1, theme = DEFAULT_RUBIX_THEME } = {}) {
    super();
    this.name = "RubixMega";
    this.theme = theme;

    this.core = new Piece({
      size,
      type: PIECE_TYPES.CORE,
      location: { x: 0, y: 0, z: 0 },
      theme: this.theme,
    });
    this.piece = this.core;
    this.corners = [];

    for (const x of [-1, 1]) {
      for (const y of [-1, 1]) {
        for (const z of [-1, 1]) {
          this.corners.push(new Piece({
            size,
            type: PIECE_TYPES.CORNER,
            location: { x, y, z },
            theme: this.theme,
          }));
          const corner = this.corners.at(-1);
          corner.position.set(x, y, z).multiplyScalar(size + spacing);
          this.orientCorner(corner, x, y, z);
        }
      }
    }

    this.pieces = [this.core, ...this.corners];
    this.add(...this.pieces);
  }

  orientCorner(corner, x, y, z) {
    // A proper rotation (never a mirrored scale) can point the canonical +X,
    // +Y and +Z faces at every corner. Odd-sign corners need an odd axis
    // permutation to keep the resulting basis right-handed.
    const targets = [
      new THREE.Vector3(x, 0, 0),
      new THREE.Vector3(0, y, 0),
      new THREE.Vector3(0, 0, z),
    ];
    if (x * y * z < 0) [targets[0], targets[1]] = [targets[1], targets[0]];
    corner.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(...targets));
  }

  dispose() {
    this.pieces.forEach((piece) => piece.dispose());
  }
}

// Keep the original export useful to callers while making it reflect the
// palette used by a default RubixMega.
export const FACE_COLORS = DEFAULT_RUBIX_THEME;
export { RUBIX_THEMES };
