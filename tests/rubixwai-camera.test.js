import assert from "node:assert/strict";
import test from "node:test";
import {
  INITIAL_CAMERA_POSITION,
  MAX_CAMERA_DISTANCE,
  MIN_CAMERA_DISTANCE,
} from "../src/rubixwai/RubixWaiScene.js";

test("RubixWai starts with generous space around the cube and permits outward zoom", () => {
  assert.deepEqual(INITIAL_CAMERA_POSITION, [14.4, 11.4, 17.4]);
  assert.equal(MIN_CAMERA_DISTANCE, 4);
  assert.equal(MAX_CAMERA_DISTANCE, 48);
});
