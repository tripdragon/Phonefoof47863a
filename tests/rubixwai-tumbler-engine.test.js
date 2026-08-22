import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { TumblerEngine_MV_1 } from "../src/rubixwai/TumblerEngine_MV_1.js";

function makeDomElement() {
  return {
    style: {},
    addEventListener() {},
    removeEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 400 }),
  };
}

test("a RubixWai turn keeps the grabbed point localized under the pointer", () => {
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);

  const engine = new TumblerEngine_MV_1({ camera, domElement: makeDomElement() });
  const cube = new THREE.Group();
  const piece = new THREE.Group();
  piece.isPiece = true;
  piece.position.set(1, 0, 0);
  cube.core = new THREE.Group();
  cube.pieces = [piece];
  cube.add(piece);
  cube.updateMatrixWorld(true);

  const hitPoint = new THREE.Vector3(1, 0, 0);
  const start = engine.screenPosition(hitPoint);
  const gesture = {
    cube,
    piece,
    hitPoint,
    faceAxis: "z",
    pointerId: 4,
    start,
    previous: start.clone(),
    axis: null,
    angle: 0,
    lastDelta: 0,
  };
  engine.gesture = gesture;
  engine.beginTurn(gesture, engine.tangentFor("y", cube, hitPoint));

  const expectedAngle = Math.PI / 4;
  const movedWorldPoint = hitPoint.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), expectedAngle);
  const movedPointer = engine.screenPosition(movedWorldPoint);
  engine.onPointerMove({
    pointerId: 4,
    clientX: movedPointer.x,
    clientY: movedPointer.y,
    preventDefault() {},
  });

  assert.equal(gesture.axis, "y");
  assert.ok(Math.abs(gesture.angle - expectedAngle) < 1e-10);
  assert.ok(Math.abs(gesture.pivot.rotation.y - expectedAngle) < 1e-10);
  engine.dispose();
});
