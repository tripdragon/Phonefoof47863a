import * as THREE from "three";
import { Piece, PIECE_TYPES } from "./Piece.js";

const FACE_COLORS = Object.freeze({
  right: 0xb71234,
  left: 0xff5800,
  top: 0xffffff,
  bottom: 0xffd500,
  front: 0x009b48,
  back: 0x0046ad,
});

/** The Rubik's-cube model and owner of its pieces. */
export class RubixMega extends THREE.Object3D {
  constructor({ size = 2.4 } = {}) {
    super();
    this.name = "RubixMega";

    this.core = new Piece({
      size,
      type: PIECE_TYPES.CORE,
      location: { x: 0, y: 0, z: 0 },
      faceColors: FACE_COLORS,
    });
    this.piece = this.core;
    this.add(this.piece);
  }

  dispose() {
    this.piece.dispose();
  }
}

export { FACE_COLORS };
