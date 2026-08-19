import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { FACE_COLORS, RubixMega } from "../src/rubixwai/RubixMega.js";
import { HIDDEN_FACE_COLOR, Piece, PIECE_TYPES } from "../src/rubixwai/Piece.js";

test("RubixMega owns one core Piece", () => {
  const cube = new RubixMega();

  assert.ok(cube instanceof THREE.Object3D);
  assert.ok(cube.piece instanceof Piece);
  assert.equal(cube.piece, cube.core);
  assert.equal(cube.piece.pieceType, PIECE_TYPES.CORE);
  assert.equal(cube.piece.parent, cube);
  assert.equal(cube.children.length, 1);

  cube.dispose();
});

test("Piece uses six shader planes and greys faces hidden by its location", () => {
  const piece = new Piece({
    type: PIECE_TYPES.CENTER,
    location: { x: 1, y: 0, z: 0 },
    faceColors: FACE_COLORS,
  });

  assert.equal(piece.children.length, 6);
  assert.ok(piece.children.every((face) => face.geometry instanceof THREE.PlaneGeometry));
  assert.ok(piece.materials.every((material) => material instanceof THREE.ShaderMaterial));
  assert.equal(piece.faces.right.material.uniforms.faceColor.value.getHex(), FACE_COLORS.right);
  assert.equal(piece.faces.right.material.uniforms.borderColor.value.getHex(), 0x000000);
  assert.equal(piece.faces.left.material.uniforms.faceColor.value.getHex(), HIDDEN_FACE_COLOR);
  assert.equal(piece.faces.left.material.uniforms.borderColor.value.getHex(), HIDDEN_FACE_COLOR);

  piece.dispose();
});
