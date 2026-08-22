import assert from "node:assert/strict";
import test from "node:test";
import {
  INITIAL_CAMERA_POSITION,
  MAX_CAMERA_DISTANCE,
  MIN_CAMERA_DISTANCE,
} from "../src/rubixwai/RubixWaiScene.js";

test("RubixWai starts twice as far away and permits twice the outward zoom", () => {
  assert.deepEqual(INITIAL_CAMERA_POSITION, [9.6, 7.6, 11.6]);
  assert.equal(MIN_CAMERA_DISTANCE, 4);
  assert.equal(MAX_CAMERA_DISTANCE, 48);
});
