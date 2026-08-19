import * as THREE from "three";
import { Piece, PIECE_TYPES } from "./Piece.js";
import { DEFAULT_RUBIX_THEME, RUBIX_THEMES } from "./themes.js";

/** The Rubik's-cube model and owner of its pieces. */
export class RubixMega extends THREE.Object3D {
  constructor({ size = 2.4, theme = DEFAULT_RUBIX_THEME } = {}) {
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
    this.add(this.piece);
  }

  dispose() {
    this.piece.dispose();
  }
}

// Keep the original export useful to callers while making it reflect the
// palette used by a default RubixMega.
export const FACE_COLORS = DEFAULT_RUBIX_THEME;
export { RUBIX_THEMES };
