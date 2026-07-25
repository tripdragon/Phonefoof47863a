import assert from "node:assert/strict";
import test from "node:test";
import { Vector3 } from "three";

import { DirectionArrow } from "../src/three-demo/rubixC/fingers_api/directionArrow.js";

function makeDistanceArrow(start = new Vector3()) {
  const calls = {};
  const visual = {
    position: new Vector3(),
    visible: false,
    setDirection(direction) { calls.direction = direction.clone(); },
    setLength(options) { calls.length = options.length; },
  };
  const arrow = Object.create(DirectionArrow.prototype);
  arrow.EPSILONish = 0.000001;
  arrow.currentDragDistance = 0;
  arrow.ff = { getPointDown: () => start };
  arrow.arrows = {
    distance: {
      visual,
      dirV: new Vector3(),
      originV: new Vector3(),
      distance: 0,
    },
  };
  return { arrow, visual, calls };
}

test("distance arrow spans from pointer start to the latest cursor point", () => {
  const start = new Vector3(1, 2, 3);
  const { arrow, visual, calls } = makeDistanceArrow(start);

  arrow.updateDistanceArrow([
    { point: start.clone() },
    { point: new Vector3(4, 6, 3) },
  ]);

  assert.equal(arrow.arrows.distance.distance, 5);
  assert.equal(arrow.getDragDistance(), 5);
  assert.equal(arrow.currentDragDistance, 5);
  assert.deepEqual(visual.position.toArray(), [1, 2, 3]);
  assert.ok(calls.direction.distanceTo(new Vector3(0.6, 0.8, 0)) < 1e-12);
  assert.equal(calls.length, 5);
  assert.equal(visual.visible, true);
});

test("distance arrow hides when there is no cursor distance", () => {
  const start = new Vector3(1, 2, 3);
  const { arrow, visual } = makeDistanceArrow(start);
  visual.visible = true;

  arrow.updateDistanceArrow([{ point: start.clone() }]);

  assert.equal(arrow.arrows.distance.distance, 0);
  assert.equal(visual.visible, false);
});
