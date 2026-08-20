import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { FACE_COLORS, RUBIX_THEMES, RubixMega } from "../src/rubixwai/RubixMega.js";
import {
  HIDDEN_FACE_COLOR,
  Piece,
  PIECE_TYPES,
  PIVOT_VISUAL_RENDER_ORDER,
} from "../src/rubixwai/Piece.js";
import { PieceNormalsDebugger } from "../src/rubixwai/PieceNormalsDebugger.js";

test("RubixMega owns one core Piece and eight outward-offset corners", () => {
  const cube = new RubixMega();

  assert.ok(cube instanceof THREE.Object3D);
  assert.ok(cube.piece instanceof Piece);
  assert.equal(cube.piece, cube.core);
  assert.equal(cube.piece.pieceType, PIECE_TYPES.CORE);
  assert.equal(cube.piece.parent, cube);
  assert.equal(cube.children.length, 9);
  assert.equal(cube.corners.length, 8);
  assert.deepEqual(cube.pieces, [cube.core, ...cube.corners]);
  assert.ok(cube.corners.every((corner) => corner.pieceType === PIECE_TYPES.CORNER));
  assert.deepEqual(
    cube.corners.map((corner) => corner.position.toArray()),
    [
      [-3.4, -3.4, -3.4],
      [-3.4, -3.4, 3.4],
      [-3.4, 3.4, -3.4],
      [-3.4, 3.4, 3.4],
      [3.4, -3.4, -3.4],
      [3.4, -3.4, 3.4],
      [3.4, 3.4, -3.4],
      [3.4, 3.4, 3.4],
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

test("Piece uses six shader planes and greys faces hidden by its location", () => {
  const piece = new Piece({
    type: PIECE_TYPES.CENTER,
    location: { x: 1, y: 0, z: 0 },
    faceColors: FACE_COLORS,
  });

  assert.equal(Object.keys(piece.faces).length, 6);
  assert.ok(Object.values(piece.faces).every((face) => face.geometry instanceof THREE.PlaneGeometry));
  assert.ok(piece.materials.every((material) => material instanceof THREE.ShaderMaterial));
  assert.equal(piece.faces.right.material.uniforms.faceColor.value.getHex(), FACE_COLORS.right);
  assert.equal(piece.faces.right.material.uniforms.borderColor.value.getHex(), 0x000000);
  assert.equal(piece.faces.left.material.uniforms.faceColor.value.getHex(), HIDDEN_FACE_COLOR);
  assert.equal(piece.faces.left.material.uniforms.borderColor.value.getHex(), HIDDEN_FACE_COLOR);

  piece.dispose();
});

test("Piece planes use a negative local half-size offset from their corner pivots", () => {
  const size = 2.4;
  const piece = new Piece({ size });
  piece.geometry.computeBoundingBox();

  assert.ok(piece.geometry.boundingBox.min.distanceTo(new THREE.Vector3(-size, -size, 0)) < 1e-6);
  assert.ok(piece.geometry.boundingBox.max.distanceTo(new THREE.Vector3(0, 0, 0)) < 1e-6);

  const halfSize = size / 2;
  const expectedPivots = {
    right: [halfSize, halfSize, -halfSize],
    left: [-halfSize, halfSize, halfSize],
    top: [halfSize, halfSize, -halfSize],
    bottom: [halfSize, -halfSize, halfSize],
    front: [halfSize, halfSize, halfSize],
    back: [-halfSize, halfSize, -halfSize],
  };
  for (const [name, face] of Object.entries(piece.faces)) {
    assert.ok(
      face.position.distanceTo(new THREE.Vector3(...expectedPivots[name])) < 1e-12,
      `${name} pivot is not on its expected cube corner`,
    );
  }

  const expectedCenters = {
    right: [size / 2, 0, 0],
    left: [-size / 2, 0, 0],
    top: [0, size / 2, 0],
    bottom: [0, -size / 2, 0],
    front: [0, 0, size / 2],
    back: [0, 0, -size / 2],
  };
  const localCenter = new THREE.Vector3(-size / 2, -size / 2, 0);
  piece.updateMatrixWorld(true);

  for (const [name, face] of Object.entries(piece.faces)) {
    const center = localCenter.clone().applyMatrix4(face.matrixWorld);
    assert.ok(
      center.distanceTo(new THREE.Vector3(...expectedCenters[name])) < 1e-12,
      `${name} face moved away from its cube boundary`,
    );
  }

  piece.dispose();
});

test("Piece exposes a small yellow pivot-center debugger through visuals", () => {
  const piece = new Piece();

  assert.ok(piece.visuals instanceof THREE.Mesh);
  assert.equal(piece.visuals.parent, piece);
  assert.equal(piece.visuals.geometry.type, "SphereGeometry");
  assert.equal(piece.visuals.material.color.getHex(), 0xffff00);
  assert.equal(piece.visuals.material.depthTest, false);
  assert.equal(piece.visuals.material.depthWrite, false);
  assert.equal(piece.visuals.material.transparent, true);
  assert.equal(piece.visuals.renderOrder, PIVOT_VISUAL_RENDER_ORDER);
  assert.deepEqual(piece.visuals.position.toArray(), [0, 0, 0]);

  piece.dispose();
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
