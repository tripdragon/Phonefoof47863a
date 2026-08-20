import * as THREE from "three";
import { Piece, PIECE_TYPES } from "./Piece.js";
import { DEFAULT_RUBIX_THEME, RUBIX_THEMES } from "./themes.js";

export const COLOR_INDEXES = Object.freeze({
  RIGHT: 0,
  LEFT: 1,
  TOP: 2,
  BOTTOM: 3,
  FRONT: 4,
  BACK: 5,
});

const { RIGHT, LEFT, TOP, BOTTOM, FRONT, BACK } = COLOR_INDEXES;

/** Solved-cube locations and the outward colors carried by every visible piece. */
export const PIECE_LOOKUP = Object.freeze({
  right: { type: PIECE_TYPES.CENTER, location: [1, 0, 0], colorIndexes: [RIGHT] },
  left: { type: PIECE_TYPES.CENTER, location: [-1, 0, 0], colorIndexes: [LEFT] },
  top: { type: PIECE_TYPES.CENTER, location: [0, 1, 0], colorIndexes: [TOP] },
  bottom: { type: PIECE_TYPES.CENTER, location: [0, -1, 0], colorIndexes: [BOTTOM] },
  front: { type: PIECE_TYPES.CENTER, location: [0, 0, 1], colorIndexes: [FRONT] },
  back: { type: PIECE_TYPES.CENTER, location: [0, 0, -1], colorIndexes: [BACK] },
  "right-top": { type: PIECE_TYPES.EDGE, location: [1, 1, 0], colorIndexes: [RIGHT, TOP] },
  "right-bottom": { type: PIECE_TYPES.EDGE, location: [1, -1, 0], colorIndexes: [RIGHT, BOTTOM] },
  "right-front": { type: PIECE_TYPES.EDGE, location: [1, 0, 1], colorIndexes: [RIGHT, FRONT] },
  "right-back": { type: PIECE_TYPES.EDGE, location: [1, 0, -1], colorIndexes: [RIGHT, BACK] },
  "left-top": { type: PIECE_TYPES.EDGE, location: [-1, 1, 0], colorIndexes: [LEFT, TOP] },
  "left-bottom": { type: PIECE_TYPES.EDGE, location: [-1, -1, 0], colorIndexes: [LEFT, BOTTOM] },
  "left-front": { type: PIECE_TYPES.EDGE, location: [-1, 0, 1], colorIndexes: [LEFT, FRONT] },
  "left-back": { type: PIECE_TYPES.EDGE, location: [-1, 0, -1], colorIndexes: [LEFT, BACK] },
  "top-front": { type: PIECE_TYPES.EDGE, location: [0, 1, 1], colorIndexes: [TOP, FRONT] },
  "top-back": { type: PIECE_TYPES.EDGE, location: [0, 1, -1], colorIndexes: [TOP, BACK] },
  "bottom-front": { type: PIECE_TYPES.EDGE, location: [0, -1, 1], colorIndexes: [BOTTOM, FRONT] },
  "bottom-back": { type: PIECE_TYPES.EDGE, location: [0, -1, -1], colorIndexes: [BOTTOM, BACK] },
  "right-top-front": { type: PIECE_TYPES.CORNER, location: [1, 1, 1], colorIndexes: [RIGHT, TOP, FRONT] },
  "right-top-back": { type: PIECE_TYPES.CORNER, location: [1, 1, -1], colorIndexes: [RIGHT, TOP, BACK] },
  "right-bottom-front": { type: PIECE_TYPES.CORNER, location: [1, -1, 1], colorIndexes: [RIGHT, BOTTOM, FRONT] },
  "right-bottom-back": { type: PIECE_TYPES.CORNER, location: [1, -1, -1], colorIndexes: [RIGHT, BOTTOM, BACK] },
  "left-top-front": { type: PIECE_TYPES.CORNER, location: [-1, 1, 1], colorIndexes: [LEFT, TOP, FRONT] },
  "left-top-back": { type: PIECE_TYPES.CORNER, location: [-1, 1, -1], colorIndexes: [LEFT, TOP, BACK] },
  "left-bottom-front": { type: PIECE_TYPES.CORNER, location: [-1, -1, 1], colorIndexes: [LEFT, BOTTOM, FRONT] },
  "left-bottom-back": { type: PIECE_TYPES.CORNER, location: [-1, -1, -1], colorIndexes: [LEFT, BOTTOM, BACK] },
});

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
    this.centers = [];
    this.edges = [];
    this.corners = [];

    for (const [pieceName, definition] of Object.entries(PIECE_LOOKUP)) {
      const [x, y, z] = definition.location;
      const piece = new Piece({
        size,
        type: definition.type,
        location: { x, y, z },
        theme: this.theme,
        colorIndexes: definition.colorIndexes,
      });
      piece.name = `RubixPiece-${pieceName}`;
      piece.position.set(x, y, z).multiplyScalar(size + spacing);
      this[`${definition.type}s`].push(piece);
    }

    this.pieces = [this.core, ...this.centers, ...this.edges, ...this.corners];
    this.add(...this.pieces);
  }

  dispose() {
    this.pieces.forEach((piece) => piece.dispose());
  }
}

// Keep the original export useful to callers while making it reflect the
// palette used by a default RubixMega.
export const FACE_COLORS = DEFAULT_RUBIX_THEME;
export { RUBIX_THEMES };
