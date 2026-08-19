import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { FACE_COLORS, RubixMega } from "../src/rubixwai/RubixMega.js";

test("RubixMega is an Object3D with the six traditional face colors", () => {
  const cube = new RubixMega();

  assert.ok(cube instanceof THREE.Object3D);
  assert.deepEqual(cube.materials.map((material) => material.color.getHex()), Object.values(FACE_COLORS));
  assert.equal(cube.cube.parent, cube);

  cube.dispose();
});
