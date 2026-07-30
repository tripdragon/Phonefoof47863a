import assert from "node:assert/strict";
import test from "node:test";
import { Vector3 } from "three";

import { TouchesController } from "../src/three-demo/rubixC/fingers_api/touchesController.js";

function makeController(touchState) {
  const sessionPoints = {
    screen: [{}],
    cube: [{}],
    plane: [{}],
    cubeRayHits: [{}],
    planeRayHits: [{}],
  };

  const controller = Object.create(TouchesController.prototype);
  Object.assign(controller, {
    multitouch: { pointerUp: () => touchState },
    engines: {
      session: {
        points: sessionPoints,
        reset() {
          Object.values(this.points).forEach(points => { points.length = 0; });
        },
      },
      plucker: { plucked: { group: null }, reset() { this.wasReset = true; } },
      directionArrow: {
        getDragDistance: () => 0,
        getAbsoluteDirection: () => new Vector3(1, 0, 0),
      },
    },
    ff: { controls: { enabled: false } },
    releasePools() {},
    state: "following",
    isOnCube: true,
    IS_DOWN: true,
    hitDown: {},
    selectedPiece: {},
    m_selectedPiece: {},
    currentDragDistance: 2,
    lastTriggeredDistance: 1,
    lastTumbleDelta: 0,
  });

  return { controller, sessionPoints };
}

test("the final pointer release flushes session and drag stores", () => {
  const { controller, sessionPoints } = makeController({
    hasActivePointers: false,
    shouldSkipTouchUp: false,
  });

  controller.onPointerUp({ pointerId: 1 });

  Object.values(sessionPoints).forEach(points => assert.equal(points.length, 0));
  assert.equal(controller.hitDown, null);
  assert.equal(controller.selectedPiece, null);
  assert.equal(controller.m_selectedPiece, null);
  assert.equal(controller.currentDragDistance, 0);
  assert.equal(controller.lastTriggeredDistance, 0);
  assert.equal(controller.IS_DOWN, false);
  assert.equal(controller.isOnCube, false);
  assert.equal(controller.ff.controls.enabled, true);
  assert.equal(controller.engines.plucker.wasReset, true);
});

test("a release waits to flush while another pointer remains active", () => {
  const { controller, sessionPoints } = makeController({
    hasActivePointers: true,
    shouldSkipTouchUp: false,
  });

  controller.onPointerUp({ pointerId: 1 });

  assert.equal(sessionPoints.plane.length, 1);
  assert.notEqual(controller.hitDown, null);
  assert.equal(controller.currentDragDistance, 2);
});

test("the final multitouch release also flushes stores", () => {
  const { controller, sessionPoints } = makeController({
    hasActivePointers: false,
    shouldSkipTouchUp: true,
  });

  controller.onPointerUp({ pointerId: 2 });

  Object.values(sessionPoints).forEach(points => assert.equal(points.length, 0));
  assert.equal(controller.hitDown, null);
  assert.equal(controller.currentDragDistance, 0);
});

test("active tumbling remaps and flips the direction-arrow distance while dragging", () => {
  const { controller } = makeController({
    hasActivePointers: false,
    shouldSkipTouchUp: false,
  });
  const group = {};
  const leverV = new Vector3(0, 0, 1);
  const force = new Vector3(1, 0, 0);
  const originalSetLength = force.setLength;
  let rotationValue;
  let torqueArgs;

  force.setLength = function setLength(length) {
    rotationValue = length;
    return originalSetLength.call(this, length);
  };

  controller.engines.plucker.plucked = { group, leverV, force };
  controller.engines.directionArrow.getDragDistance = () => 1.75;
  controller.ff.cube = {
    torqueGroup(args) { torqueArgs = args; },
  };

  controller.selectedPiece = { piece: {} };
  controller.engines.plucker.pluck = () => controller.engines.plucker.plucked;
  controller.updateActiveTumble();

  assert.equal(torqueArgs.group, group);
  assert.equal(torqueArgs.leverV, leverV);
  const expectedAngle = -(1.75 / 3) * (Math.PI / 2);
  assert.ok(Math.abs(rotationValue - expectedAngle) < 1e-12);
  assert.ok(Math.abs(torqueArgs.forceV.length() - Math.abs(expectedAngle)) < 1e-12);
  assert.ok(torqueArgs.forceV.distanceTo(new Vector3(expectedAngle, 0, 0)) < 1e-12);
});

test("active tumbling applies only the change in drag distance", () => {
  const { controller } = makeController({
    hasActivePointers: false,
    shouldSkipTouchUp: false,
  });
  const force = new Vector3(1, 0, 0);
  let rotationValue;
  const originalSetLength = force.setLength;

  force.setLength = function setLength(length) {
    rotationValue = length;
    return originalSetLength.call(this, length);
  };

  controller.engines.plucker.plucked = {
    group: {},
    leverV: new Vector3(0, 0, 1),
    force,
  };
  let dragDistance = -3;
  const rotations = [];
  controller.engines.directionArrow.getDragDistance = () => dragDistance;
  controller.engines.directionArrow.getAbsoluteDirection = () => new Vector3(1, 0, 0);
  controller.engines.plucker.pluck = () => controller.engines.plucker.plucked;
  controller.selectedPiece = { piece: {} };
  controller.ff.cube = { torqueGroup() { rotations.push(rotationValue); } };

  controller.updateActiveTumble();
  dragDistance = -1.5;
  controller.updateActiveTumble();

  assert.deepEqual(rotations, [Math.PI / 2, -Math.PI / 4]);
});

test("more than two plane points activate tumbling during a drag", () => {
  const { controller, sessionPoints } = makeController({});
  let updates = 0;
  controller.state = "seeking";
  sessionPoints.plane.push({}, {}, {});
  controller.seekOnCube = () => {};
  controller.seekingOnHitZonePlane = () => {};
  controller.checkMagicPlaneDistanceThreshold = () => {};
  controller.engines.directionArrow.refresh = () => {};
  controller.updateActiveTumble = () => { updates += 1; };

  controller.seeking({});

  assert.equal(controller.state, "activeTumbling");
  assert.equal(updates, 1);
});
