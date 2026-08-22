import * as THREE from "three";
import { Engine } from "./Engine.js";

export const DRAG_START_PIXELS = 7;
export const SNAP_RADIANS = Math.PI / 2;
export const SNAP_SPEED_RADIANS_PER_SECOND = Math.PI * 5;

const AXES = ["x", "y", "z"];
const AXIS_VECTORS = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};

/**
 * Top-level, pointer-driven RubixMega controller (mouse, pen, and touch).
 *
 * Notes:
 * - A press only becomes a turn after a short movement, preventing taps from
 *   accidentally moving the puzzle.
 * - The first purposeful motion chooses the most natural of the two axes that
 *   lie in the touched face. That axis and layer remain locked until release.
 * - Pieces follow the pointer through a temporary pivot. On release the pivot
 *   continues in the direction it was travelling and eases into the next
 *   quarter-turn, giving the stop a magnetic feel.
 * - OrbitControls is disabled only while a cube gesture owns the pointer.
 */
export class TumblerEngine_MV_1 extends Engine {
  constructor({ camera, domElement, orbitControls = null } = {}) {
    super();
    if (!camera || !domElement) {
      throw new TypeError("TumblerEngine_MV_1 requires a camera and domElement");
    }
    this.camera = camera;
    this.domElement = domElement;
    this.orbitControls = orbitControls;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.gesture = null;
    this.snap = null;

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.domElement.addEventListener("pointerdown", this.onPointerDown);
    this.domElement.addEventListener("pointermove", this.onPointerMove);
    this.domElement.addEventListener("pointerup", this.onPointerUp);
    this.domElement.addEventListener("pointercancel", this.onPointerUp);
  }

  activate() {
    super.activate();
    this.domElement.style.touchAction = "none";
  }

  eventPoint(event) {
    return new THREE.Vector2(event.clientX, event.clientY);
  }

  pick(event) {
    const rect = this.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);

    for (const cube of this.cubes) {
      const hit = this.raycaster.intersectObject(cube, true)[0];
      if (!hit) continue;
      let piece = hit.object;
      while (piece && !piece.isPiece) piece = piece.parent;
      if (!piece || piece === cube.core) continue;

      // Convert the rendered triangle normal all the way back to cube space;
      // this keeps turns correct even when RubixMega itself is tilted.
      const worldNormal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
      const cubeQuaternion = cube.getWorldQuaternion(new THREE.Quaternion());
      const localNormal = worldNormal.applyQuaternion(cubeQuaternion.invert());
      const faceAxis = AXES.reduce((best, axis) => (
        Math.abs(localNormal[axis]) > Math.abs(localNormal[best]) ? axis : best
      ), "x");
      return { cube, piece, hitPoint: hit.point.clone(), faceAxis };
    }
    return null;
  }

  onPointerDown(event) {
    if (!this.active || this.gesture || this.snap || event.button > 0) return;
    const selection = this.pick(event);
    if (!selection) return;
    this.gesture = {
      ...selection,
      pointerId: event.pointerId,
      start: this.eventPoint(event),
      previous: this.eventPoint(event),
      axis: null,
      angle: 0,
      lastDelta: 0,
    };
    // Claiming a visible tile is enough to reserve this pointer for the cube;
    // otherwise OrbitControls can move the camera during the intent threshold.
    if (this.orbitControls) this.orbitControls.enabled = false;
    this.domElement.setPointerCapture?.(event.pointerId);
  }

  screenPosition(worldPosition) {
    const rect = this.domElement.getBoundingClientRect();
    const projected = worldPosition.clone().project(this.camera);
    return new THREE.Vector2(
      rect.left + (projected.x + 1) * rect.width / 2,
      rect.top + (1 - projected.y) * rect.height / 2,
    );
  }

  tangentFor(axis, cube, worldPoint) {
    const cubeQuaternion = cube.getWorldQuaternion(new THREE.Quaternion());
    const worldAxis = AXIS_VECTORS[axis].clone().applyQuaternion(cubeQuaternion);
    const center = cube.getWorldPosition(new THREE.Vector3());
    const radius = worldPoint.clone().sub(center);
    const tangentWorld = worldAxis.cross(radius);
    const scale = Math.max(radius.length(), 1);
    const nextWorld = worldPoint.clone().addScaledVector(tangentWorld, 0.2 / scale);
    return this.screenPosition(nextWorld).sub(this.screenPosition(worldPoint)).multiplyScalar(5);
  }

  beginTurn(gesture, drag) {
    const candidates = AXES.filter((axis) => axis !== gesture.faceAxis);
    const scored = candidates.map((axis) => {
      const tangent = this.tangentFor(axis, gesture.cube, gesture.hitPoint);
      return { axis, tangent, score: Math.abs(drag.dot(tangent)) / Math.max(tangent.length(), 1) };
    });
    const chosen = scored.sort((a, b) => b.score - a.score)[0];
    gesture.axis = chosen.axis;
    gesture.tangent = chosen.tangent;
    gesture.pixelsPerRadian = Math.max(chosen.tangent.length(), 12);

    const pivot = new THREE.Group();
    pivot.name = "TumblerEngine_MV_1-turn-pivot";
    gesture.cube.add(pivot);
    const layer = gesture.piece.position[gesture.axis];
    const pieces = gesture.cube.pieces.filter((piece) => (
      piece !== gesture.cube.core && Math.abs(piece.position[gesture.axis] - layer) < 1e-5
    ));
    pieces.forEach((piece) => pivot.attach(piece));
    gesture.pivot = pivot;
    gesture.pieces = pieces;
  }

  onPointerMove(event) {
    const gesture = this.gesture;
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const point = this.eventPoint(event);
    const fromStart = point.clone().sub(gesture.start);
    if (!gesture.axis) {
      if (fromStart.length() < DRAG_START_PIXELS) return;
      this.beginTurn(gesture, fromStart);
    }
    event.preventDefault();
    const movement = point.clone().sub(gesture.previous);
    const delta = movement.dot(gesture.tangent.clone().normalize()) / gesture.pixelsPerRadian;
    gesture.pivot.rotation[gesture.axis] += delta;
    gesture.angle += delta;
    if (Math.abs(delta) > 1e-5) gesture.lastDelta = delta;
    gesture.previous.copy(point);
  }

  onPointerUp(event) {
    const gesture = this.gesture;
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    this.domElement.releasePointerCapture?.(event.pointerId);
    this.gesture = null;
    if (!gesture.axis) {
      if (this.orbitControls) this.orbitControls.enabled = true;
      return;
    }

    const direction = Math.sign(gesture.lastDelta || gesture.angle || 1);
    const quotient = gesture.angle / SNAP_RADIANS;
    let target = direction > 0 ? Math.ceil(quotient) : Math.floor(quotient);
    if (Math.abs(target * SNAP_RADIANS - gesture.angle) < 1e-6) target += direction;
    this.snap = { ...gesture, targetAngle: target * SNAP_RADIANS };
  }

  update(deltaSeconds) {
    if (!this.active || !this.snap) return;
    const snap = this.snap;
    const remaining = snap.targetAngle - snap.angle;
    const maxStep = SNAP_SPEED_RADIANS_PER_SECOND * Math.max(0, deltaSeconds);
    const step = Math.sign(remaining) * Math.min(Math.abs(remaining), maxStep);
    snap.pivot.rotation[snap.axis] += step;
    snap.angle += step;
    if (Math.abs(snap.targetAngle - snap.angle) < 1e-7) this.finishSnap();
  }

  finishSnap() {
    const { cube, pivot, pieces } = this.snap;
    pivot.updateMatrixWorld(true);
    pieces.forEach((piece) => {
      cube.attach(piece);
      piece.position.set(...piece.position.toArray().map((value) => Math.round(value * 1e8) / 1e8));
      piece.quaternion.normalize();
    });
    pivot.removeFromParent();
    this.snap = null;
    if (this.orbitControls) this.orbitControls.enabled = true;
  }

  dispose() {
    this.domElement.removeEventListener("pointerdown", this.onPointerDown);
    this.domElement.removeEventListener("pointermove", this.onPointerMove);
    this.domElement.removeEventListener("pointerup", this.onPointerUp);
    this.domElement.removeEventListener("pointercancel", this.onPointerUp);
    if (this.snap) this.finishSnap();
    if (this.gesture?.pivot) {
      const { cube, pivot, pieces } = this.gesture;
      pivot.updateMatrixWorld(true);
      pieces.forEach((piece) => cube.attach(piece));
      pivot.removeFromParent();
    }
    this.gesture = null;
    if (this.orbitControls) this.orbitControls.enabled = true;
    this.domElement.style.touchAction = "";
    super.dispose();
  }
}
