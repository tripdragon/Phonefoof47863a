import * as THREE from "three";
import { DEFAULT_RUBIX_THEME } from "./themes.js";
import { Face } from "./Face.js";

export const PIECE_TYPES = Object.freeze({
  CORE: "core",
  CENTER: "center",
  EDGE: "edge",
  CORNER: "corner",
});

export const DEFAULT_BORDER_COLOR = 0x000000;

const FACE_LAYOUT = Object.freeze([
  { name: "right", axis: "x", sign: 1, rotation: [0, Math.PI / 2, 0] },
  { name: "left", axis: "x", sign: -1, rotation: [0, -Math.PI / 2, 0] },
  { name: "top", axis: "y", sign: 1, rotation: [-Math.PI / 2, 0, 0] },
  { name: "bottom", axis: "y", sign: -1, rotation: [Math.PI / 2, 0, 0] },
  { name: "front", axis: "z", sign: 1, rotation: [0, 0, 0] },
  { name: "back", axis: "z", sign: -1, rotation: [0, Math.PI, 0] },
]);

const TYPE_FACES = Object.freeze({
  [PIECE_TYPES.CORE]: FACE_LAYOUT,
  [PIECE_TYPES.CENTER]: [FACE_LAYOUT[4]],
  [PIECE_TYPES.EDGE]: [FACE_LAYOUT[2], FACE_LAYOUT[4]],
  [PIECE_TYPES.CORNER]: [FACE_LAYOUT[0], FACE_LAYOUT[2], FACE_LAYOUT[4]],
});

/** A transform-only Rubik's-cube piece that groups its Face meshes. */
export class Piece extends THREE.Group {
  constructor({
    size = 2.4,
    type = PIECE_TYPES.CORE,
    location = { x: 0, y: 0, z: 0 },
    theme = DEFAULT_RUBIX_THEME,
    faceColors = theme,
    borderColor = DEFAULT_BORDER_COLOR,
  } = {}) {
    super();
    if (!Object.values(PIECE_TYPES).includes(type)) {
      throw new TypeError(`Unknown piece type: ${type}`);
    }
    if (!faceColors) throw new TypeError("Piece requires a theme or faceColors map");

    this.name = `RubixPiece-${type}`;
    this.type = type;
    this.pieceType = type;
    this.location = new THREE.Vector3(location.x, location.y, location.z);
    this.theme = theme;
    this.size = size;
    this.materials = [];
    this.faces = {};

    for (const layout of TYPE_FACES[type]) {
      const face = new Face({
        ...layout,
        size,
        color: faceColors[layout.name],
        borderColor,
      });
      this.materials.push(face.material);
      this.faces[layout.name] = face;
      this.add(face);
    }
  }

  dispose() {
    Object.values(this.faces).forEach((face) => face.dispose());
  }
}

export { FACE_LAYOUT };
