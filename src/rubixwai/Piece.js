import * as THREE from "three";
import { DEFAULT_RUBIX_THEME } from "./themes.js";
import { Face } from "./Face.js";
import { PieceVisualCenter } from "./PieceVisualCenter.js";

export const PIECE_TYPES = Object.freeze({
  CORE: "core",
  CENTER: "center",
  EDGE: "edge",
  CORNER: "corner",
});

export const DEFAULT_BORDER_COLOR = 0x000000;
export const DEFAULT_PLACEHOLDER_COLOR = 0x6b7280;
const FACE_LAYOUT = Object.freeze([
  { name: "right", axis: "x", sign: 1, rotation: [0, Math.PI / 2, 0] },
  { name: "left", axis: "x", sign: -1, rotation: [0, -Math.PI / 2, 0] },
  { name: "top", axis: "y", sign: 1, rotation: [-Math.PI / 2, 0, 0] },
  { name: "bottom", axis: "y", sign: -1, rotation: [Math.PI / 2, 0, 0] },
  { name: "front", axis: "z", sign: 1, rotation: [0, 0, 0] },
  { name: "back", axis: "z", sign: -1, rotation: [0, Math.PI, 0] },
]);

export const FACTORY_FACE_LAYOUT = Object.freeze({
  [PIECE_TYPES.CORE]: FACE_LAYOUT,
  [PIECE_TYPES.CENTER]: [FACE_LAYOUT[4]],
  [PIECE_TYPES.EDGE]: [FACE_LAYOUT[2], FACE_LAYOUT[4]],
  [PIECE_TYPES.CORNER]: [FACE_LAYOUT[0], FACE_LAYOUT[2], FACE_LAYOUT[4]],
});

const DEFAULT_COLOR_INDEXES = Object.freeze(
  Object.fromEntries(
    Object.entries(FACTORY_FACE_LAYOUT).map(([type, faces]) => [
      type,
      Object.freeze(faces.map((face) => FACE_LAYOUT.indexOf(face))),
    ]),
  ),
);

const COLOR_COUNT_BY_TYPE = Object.freeze({
  [PIECE_TYPES.CORE]: 6,
  [PIECE_TYPES.CENTER]: 1,
  [PIECE_TYPES.EDGE]: 2,
  [PIECE_TYPES.CORNER]: 3,
});

/** A transform-only Rubik's-cube piece that groups its Face meshes. */
export class Piece extends THREE.Group {
  constructor({
    size = 2.4,
    type = PIECE_TYPES.CORE,
    location = { x: 0, y: 0, z: 0 },
    theme = DEFAULT_RUBIX_THEME,
    faceColors = theme,
    colorIndexes = DEFAULT_COLOR_INDEXES[type],
    borderColor = DEFAULT_BORDER_COLOR,
    placeholderColor = DEFAULT_PLACEHOLDER_COLOR,
  } = {}) {
    super();
    if (!Object.values(PIECE_TYPES).includes(type)) {
      throw new TypeError(`Unknown piece type: ${type}`);
    }
    if (!faceColors) throw new TypeError("Piece requires a theme or faceColors map");
    if (!Array.isArray(colorIndexes)) {
      throw new TypeError("Piece requires an array of color indexes");
    }
    if (colorIndexes.some((index) => !Number.isInteger(index) || !FACE_LAYOUT[index])) {
      throw new RangeError("Piece color indexes must refer to cube faces 0 through 5");
    }
    if (
      colorIndexes.length !== COLOR_COUNT_BY_TYPE[type]
      || new Set(colorIndexes).size !== colorIndexes.length
    ) {
      throw new RangeError(
        `${type} pieces require ${COLOR_COUNT_BY_TYPE[type]} unique color indexes`,
      );
    }

    this.name = `RubixPiece-${type}`;
    //this.type = type;
    this.isPiece = true;
    this.pieceType = type;
    this.location = new THREE.Vector3(location.x, location.y, location.z);
    this.theme = theme;
    this.size = size;
    this.materials = [];
    this.faces = {};
    this.colorIndexes = Object.freeze([...colorIndexes]);

    this.visuals = {
      center: new PieceVisualCenter(),
    };
    this.add(this.visuals.center);

    const factoryFaces = FACTORY_FACE_LAYOUT[type];
    const factoryPartNumbers = new Map(
      factoryFaces.map((layout, partNumber) => [layout.name, partNumber]),
    );
    const halfSize = size / 2;
    const factoryCenter = new THREE.Vector3();
    if (type !== PIECE_TYPES.CORE) {
      factoryFaces.forEach(({ axis, sign }) => {
        factoryCenter[axis] = sign * halfSize;
      });
    }

    for (const layout of FACE_LAYOUT) {
      const partNumber = factoryPartNumbers.get(layout.name);
      const isPlaceholder = partNumber === undefined;
      const paintIndex = isPlaceholder ? null : this.colorIndexes[partNumber];
      const face = new Face({
        ...layout,
        size,
        color: isPlaceholder
          ? placeholderColor
          : faceColors[FACE_LAYOUT[paintIndex].name],
        borderColor,
      });
      face.position.add(factoryCenter);
      face.userData.partNumber = isPlaceholder ? null : partNumber;
      face.userData.paintIndex = paintIndex;
      face.userData.isPlaceholder = isPlaceholder;
      this.materials.push(face.material);
      this.faces[layout.name] = face;
      this.add(face);
    }
  }

  dispose() {
    Object.values(this.faces).forEach((face) => face.dispose());
    this.visuals.center.dispose();
  }
}

export { FACE_LAYOUT };
