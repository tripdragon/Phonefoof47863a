import assert from "node:assert/strict";
import test from "node:test";
import { Vector3 } from "three";

import { Tumbler } from "../src/three-demo/rubixC/fingers_api/tumbler.js";

test("release subtracts the logged torque angle from the quarter-turn target", () => {
  const group = { axis: new Vector3(0, 1, 0) };
  const plucked = {
    group,
    leverV: new Vector3(0, 0, 0.5),
    force: new Vector3(1, 0, 0),
  };
  const frames = [];
  const releaseDeltas = [];
  let reset = false;
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = callback => {
    frames.push(callback);
    return frames.length;
  };

  try {
    const tc = {
      selectedPiece: { piece: {} },
      hitDown: {},
      engines: {
        directionArrow: {
          getDragDistance: () => -3,
          getAbsoluteDirection: () => new Vector3(1, 0, 0),
        },
      },
      resetInteractionState() { reset = true; },
    };
    const cube = {
      torqueGroup() {},
      spinGroup({ deltaAngle }) { releaseDeltas.push(deltaAngle); },
      refishGroups() {},
    };
    const tumbler = new Tumbler({
      fingersAPI: { cube, snapDuration: 250 },
      touchesController: tc,
      plucker: { plucked, pluck: () => plucked },
    });

    tumbler.updateActiveTumble();
    assert.ok(Math.abs(tumbler.tumbleAngle + Math.PI / 4) < 1e-12);

    assert.equal(tumbler.begin(), true);
    frames.shift()(0);
    frames.shift()(250);

    const releasedAngle = releaseDeltas.reduce((sum, delta) => sum + delta, 0);
    assert.ok(Math.abs(releasedAngle + Math.PI / 4) < 1e-12);
    assert.equal(reset, true);
  } finally {
    if(originalRequestAnimationFrame === undefined){
      delete globalThis.requestAnimationFrame;
    } else {
      globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    }
  }
});

