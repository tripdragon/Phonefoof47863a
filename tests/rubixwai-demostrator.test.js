import assert from "node:assert/strict";
import test from "node:test";
import { Demostrator } from "../src/rubixwai/Demostrator.js";
import { Engine } from "../src/rubixwai/Engine.js";
import {
  PAUSE_DURATION_SECONDS,
  Pingpong,
  ROTATION_SEQUENCE,
  TURN_DURATION_SECONDS,
} from "../src/rubixwai/Pingpong.js";
import { RubixMega } from "../src/rubixwai/RubixMega.js";

test("Demostrator advances only active engines", () => {
  const demostrator = new Demostrator();
  const engine = new Engine();
  let elapsed = 0;
  engine.update = (delta) => { elapsed += delta; };
  demostrator.addEngine(engine);

  demostrator.update(1);
  assert.equal(elapsed, 0);
  engine.activate();
  demostrator.update(0.25);
  assert.equal(elapsed, 0.25);
  assert.deepEqual(demostrator.engines, [engine]);

  demostrator.dispose();
});

test("Pingpong turns all six sides and three center rings, then restores the cube", () => {
  const cube = new RubixMega();
  const engine = new Pingpong();
  const originalTransforms = cube.pieces.map((piece) => ({
    position: piece.position.clone(),
    quaternion: piece.quaternion.clone(),
  }));
  engine.addCube(cube);
  engine.activate();

  assert.equal(engine.turnDuration, TURN_DURATION_SECONDS);
  assert.equal(engine.pauseDuration, PAUSE_DURATION_SECONDS);
  assert.deepEqual(
    ROTATION_SEQUENCE.slice(-3).map(({ axis, layer }) => ({ axis, layer })),
    [
      { axis: "x", layer: 0 },
      { axis: "y", layer: 0 },
      { axis: "z", layer: 0 },
    ],
  );
  engine.update(ROTATION_SEQUENCE.length * TURN_DURATION_SECONDS);
  assert.equal(engine.phase, "pause-after-forward");
  engine.update(PAUSE_DURATION_SECONDS + ROTATION_SEQUENCE.length * TURN_DURATION_SECONDS);
  assert.equal(engine.phase, "pause-after-backward");

  cube.pieces.forEach((piece, index) => {
    assert.ok(piece.position.distanceTo(originalTransforms[index].position) < 1e-7);
    assert.ok(1 - Math.abs(piece.quaternion.dot(originalTransforms[index].quaternion)) < 1e-7);
  });

  engine.dispose();
  cube.dispose();
});
