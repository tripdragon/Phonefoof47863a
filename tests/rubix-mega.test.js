import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import {
  COLOR_INDEXES,
  FACE_COLORS,
  PIECE_LOOKUP,
  RUBIX_THEMES,
  RubixMega,
} from "../src/rubixwai/RubixMega.js";
import {
  Piece,
  PIECE_TYPES,
  PLACEHOLDER_BORDER_COLOR,
  PLACEHOLDER_FACE_COLOR,
} from "../src/rubixwai/Piece.js";
import { Face } from "../src/rubixwai/Face.js";
import { PieceNormalsDebugger } from "../src/rubixwai/PieceNormalsDebugger.js";
import {
  PieceVisualCenter,
  VISUAL_CENTER_COLOR,
} from "../src/rubixwai/PieceVisualCenter.js";

test("RubixMega builds all 26 visible pieces from its solved-cube lookup", () => {
  const cube = new RubixMega();

  assert.ok(cube instanceof THREE.Object3D);
  assert.ok(cube.piece instanceof Piece);
  assert.equal(cube.piece, cube.core);
  assert.equal(cube.piece.pieceType, PIECE_TYPES.CORE);
  assert.equal(cube.piece.parent, cube);
  assert.equal(cube.children.length, 27);
  assert.equal(cube.centers.length, 6);
  assert.equal(cube.edges.length, 12);
  assert.equal(cube.corners.length, 8);
  assert.deepEqual(cube.pieces, [cube.core, ...cube.centers, ...cube.edges, ...cube.corners]);
  assert.ok(cube.centers.every((piece) => piece.colorIndexes.length === 1));
  assert.ok(cube.edges.every((piece) => piece.colorIndexes.length === 2));
  assert.ok(cube.corners.every((corner) => corner.pieceType === PIECE_TYPES.CORNER));
  assert.deepEqual(
    cube.corners.map((corner) => corner.position.toArray()),
    [
      [3.4, 3.4, 3.4],
      [3.4, 3.4, -3.4],
      [3.4, -3.4, 3.4],
      [3.4, -3.4, -3.4],
      [-3.4, 3.4, 3.4],
      [-3.4, 3.4, -3.4],
      [-3.4, -3.4, 3.4],
      [-3.4, -3.4, -3.4],
    ],
  );
  assert.equal(cube.theme, RUBIX_THEMES["a bit nicer"]);
  assert.equal(cube.core.theme, cube.theme);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(cube.core.faces).map(([name, face]) => [
        name,
        face.material.uniforms.faceColor.value.getHex(),
      ]),
    ),
    FACE_COLORS,
  );
  assert.ok(
    Object.values(cube.core.faces).every(
      (face) => face.material.uniforms.borderColor.value.getHex() === 0x000000,
    ),
  );

  cube.dispose();
});

test("piece lookup assigns the traditional fixed face colors to corners", () => {
  assert.equal(Object.keys(PIECE_LOOKUP).length, 26);
  assert.deepEqual(
    PIECE_LOOKUP["left-bottom-back"].colorIndexes,
    [COLOR_INDEXES.LEFT, COLOR_INDEXES.BOTTOM, COLOR_INDEXES.BACK],
  );

  const cube = new RubixMega({ theme: RUBIX_THEMES.classic });
  const corner = cube.corners.find((piece) => piece.name === "RubixPiece-left-bottom-back");
  const coloredFaces = Object.entries(corner.faces)
    .filter(([, face]) => !face.userData.isPlaceholder)
    .map(([name, face]) => [name, face.material.uniforms.faceColor.value.getHex()]);

  assert.deepEqual(coloredFaces, [
    ["left", RUBIX_THEMES.classic.left],
    ["bottom", RUBIX_THEMES.classic.bottom],
    ["back", RUBIX_THEMES.classic.back],
  ]);
  assert.deepEqual(corner.quaternion.toArray(), [0, 0, 0, 1]);
  cube.dispose();
});

test("RubixMega applies a selected theme to its core", () => {
  const cube = new RubixMega({ theme: RUBIX_THEMES.classic });

  assert.equal(cube.core.theme, RUBIX_THEMES.classic);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(cube.core.faces).map(([name, face]) => [
        name,
        face.material.uniforms.faceColor.value.getHex(),
      ]),
    ),
    RUBIX_THEMES.classic,
  );

  cube.dispose();
});

test("Piece is a transform-only group which owns colored and placeholder Face meshes", () => {
  const piece = new Piece({
    type: PIECE_TYPES.CENTER,
    location: { x: 1, y: 0, z: 0 },
    faceColors: FACE_COLORS,
  });

  assert.ok(piece instanceof THREE.Group);
  assert.equal(piece.geometry, undefined);
  assert.ok(piece.visuals.center instanceof PieceVisualCenter);
  assert.deepEqual(
    Object.keys(piece.faces),
    ["right", "left", "top", "bottom", "front", "back"],
  );
  assert.ok(Object.values(piece.faces).every((face) => face instanceof Face));
  assert.ok(piece.materials.every((material) => material instanceof THREE.ShaderMaterial));
  assert.equal(piece.faces.front.material.uniforms.faceColor.value.getHex(), FACE_COLORS.front);
  assert.equal(piece.faces.front.userData.isPlaceholder, false);
  assert.equal(piece.faces.right.userData.isPlaceholder, true);
  assert.equal(
    piece.faces.right.material.uniforms.faceColor.value.getHex(),
    PLACEHOLDER_FACE_COLOR,
  );
  assert.equal(
    piece.faces.right.material.uniforms.borderColor.value.getHex(),
    PLACEHOLDER_BORDER_COLOR,
  );

  piece.dispose();
});

test("Piece type determines which faces are colored and which reserve its cube space", () => {
  const size = 2.4;
  const piece = new Piece({ size, type: PIECE_TYPES.CORNER });
  const halfSize = size / 2;
  assert.deepEqual(
    Object.entries(piece.faces)
      .filter(([, face]) => !face.userData.isPlaceholder)
      .map(([name]) => name),
    ["right", "top", "front"],
  );
  assert.equal(piece.faces.left.userData.isPlaceholder, true);
  assert.deepEqual(piece.faces.right.position.toArray(), [halfSize, 0, 0]);
  assert.deepEqual(piece.faces.top.position.toArray(), [0, halfSize, 0]);
  assert.deepEqual(piece.faces.front.position.toArray(), [0, 0, halfSize]);

  piece.dispose();
});

test("every Piece displays a small flat yellow sphere at its visual center", () => {
  const cube = new RubixMega();

  for (const piece of cube.pieces) {
    const center = piece.visuals.center;
    assert.ok(center instanceof PieceVisualCenter);
    assert.equal(center.parent, piece);
    assert.deepEqual(center.position.toArray(), [0, 0, 0]);
    assert.ok(center.geometry instanceof THREE.SphereGeometry);
    assert.equal(center.geometry.parameters.radius, 0.2);
    assert.equal(center.geometry.parameters.widthSegments, 8);
    assert.equal(center.geometry.parameters.heightSegments, 8);
    assert.ok(center.material instanceof THREE.MeshBasicMaterial);
    assert.equal(center.material.color.getHex(), VISUAL_CENTER_COLOR);
  }

  cube.dispose();
});

test("PieceNormalsDebugger starts hidden and draws one outward arrow per face", () => {
  const piece = new Piece();
  const debuggerOverlay = new PieceNormalsDebugger(piece);

  assert.equal(debuggerOverlay.visible, false);
  assert.equal(debuggerOverlay.parent, piece);
  assert.equal(debuggerOverlay.arrows.length, 6);
  assert.deepEqual(
    debuggerOverlay.arrows.map((arrow) => arrow.userData.face),
    ["right", "left", "top", "bottom", "front", "back"],
  );
  assert.deepEqual(debuggerOverlay.arrows[0].position.toArray(), [1.236, 0, 0]);
  assert.equal(debuggerOverlay.arrows[0].line.material.color.getHex(), 0x0ea5e9);

  debuggerOverlay.dispose();
  assert.equal(debuggerOverlay.parent, null);
  piece.dispose();
});
