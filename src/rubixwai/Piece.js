import * as THREE from "three";
import { DEFAULT_RUBIX_THEME } from "./themes.js";

export const PIECE_TYPES = Object.freeze({
  CORE: "core",
  CENTER: "center",
  EDGE: "edge",
  CORNER: "corner",
});

export const HIDDEN_FACE_COLOR = 0x666666;
export const DEFAULT_BORDER_COLOR = 0x000000;

const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 faceColor;
  uniform vec3 borderColor;
  uniform float borderWidth;
  varying vec2 vUv;

  void main() {
    float edgeDistance = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float inside = smoothstep(borderWidth, borderWidth + fwidth(edgeDistance), edgeDistance);
    gl_FragColor = vec4(mix(borderColor, faceColor, inside), 1.0);
  }
`;

const FACE_LAYOUT = Object.freeze([
  { name: "right", axis: "x", sign: 1, rotation: [0, Math.PI / 2, 0] },
  { name: "left", axis: "x", sign: -1, rotation: [0, -Math.PI / 2, 0] },
  { name: "top", axis: "y", sign: 1, rotation: [-Math.PI / 2, 0, 0] },
  { name: "bottom", axis: "y", sign: -1, rotation: [Math.PI / 2, 0, 0] },
  { name: "front", axis: "z", sign: 1, rotation: [0, 0, 0] },
  { name: "back", axis: "z", sign: -1, rotation: [0, Math.PI, 0] },
]);

/** One physical Rubik's-cube piece, assembled from six individually shaded planes. */
export class Piece extends THREE.Object3D {
  constructor({
    size = 2.4,
    type = PIECE_TYPES.CORE,
    location = { x: 0, y: 0, z: 0 },
    theme = DEFAULT_RUBIX_THEME,
    faceColors = theme,
    borderColor = DEFAULT_BORDER_COLOR,
    hiddenFaceColor = HIDDEN_FACE_COLOR,
    outwardOffset = 0,
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
    this.position.copy(this.location).multiplyScalar(size + outwardOffset);
    this.theme = theme;
    this.geometry = new THREE.PlaneGeometry(size, size);
    this.materials = [];
    this.faces = {};

    this.visuals = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(size * 0.045, 0.025), 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xffff00, depthTest: false, depthWrite: false }),
    );
    this.visuals.name = "pivot-center-visual";
    this.visuals.renderOrder = 1;
    this.visuals.userData.debugVisual = "pivot-center";
    this.add(this.visuals);

    for (const face of FACE_LAYOUT) {
      // The single core is currently the visible cube model, so all six of its
      // faces need stickers. Positional visibility only applies to cubies that
      // will eventually surround it.
      const hidden = type !== PIECE_TYPES.CORE && this.location[face.axis] !== face.sign;
      const material = this.createFaceMaterial(
        hidden ? hiddenFaceColor : faceColors[face.name],
        hidden ? hiddenFaceColor : borderColor,
      );
      const plane = new THREE.Mesh(this.geometry, material);
      plane.name = `${face.name}-face`;
      plane.position[face.axis] = face.sign * size / 2;
      plane.rotation.set(...face.rotation);
      plane.userData.face = face.name;
      plane.userData.hidden = hidden;
      this.materials.push(material);
      this.faces[face.name] = plane;
      this.add(plane);
    }
  }

  createFaceMaterial(faceColor, borderColor) {
    return new THREE.ShaderMaterial({
      uniforms: {
        faceColor: { value: new THREE.Color(faceColor) },
        borderColor: { value: new THREE.Color(borderColor) },
        borderWidth: { value: 0.075 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      side: THREE.FrontSide,
    });
  }

  dispose() {
    this.geometry.dispose();
    this.materials.forEach((material) => material.dispose());
    this.visuals.geometry.dispose();
    this.visuals.material.dispose();
  }
}

export { FACE_LAYOUT };
