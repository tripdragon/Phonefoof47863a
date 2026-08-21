import * as THREE from "three";
import { Engine } from "./Engine.js";

export const TURN_DURATION_SECONDS = 0.5;
export const PAUSE_DURATION_SECONDS = 2;

const FACE_TURNS = Object.freeze([
  { axis: "x", side: 1, angle: -Math.PI / 2 },
  { axis: "x", side: -1, angle: Math.PI / 2 },
  { axis: "y", side: 1, angle: -Math.PI / 2 },
  { axis: "y", side: -1, angle: Math.PI / 2 },
  { axis: "z", side: 1, angle: -Math.PI / 2 },
  { axis: "z", side: -1, angle: Math.PI / 2 },
]);

/** Turns every face in sequence, then retraces the sequence forever. */
export class Pingpong extends Engine {
  constructor({ turnDuration = TURN_DURATION_SECONDS, pauseDuration = PAUSE_DURATION_SECONDS } = {}) {
    super();
    this.turnDuration = turnDuration;
    this.pauseDuration = pauseDuration;
    this.phase = "forward";
    this.turnIndex = 0;
    this.elapsed = 0;
    this.activeTurn = null;
  }

  activate() {
    super.activate();
    this.phase = "forward";
    this.turnIndex = 0;
    this.elapsed = 0;
  }

  update(deltaSeconds) {
    if (!this.active || this.cubes.length === 0) return;
    let remaining = Math.max(0, deltaSeconds);

    while (remaining > 0) {
      if (this.phase === "pause-after-forward" || this.phase === "pause-after-backward") {
        const consumed = Math.min(remaining, this.pauseDuration - this.elapsed);
        this.elapsed += consumed;
        remaining -= consumed;
        if (this.elapsed < this.pauseDuration) return;
        this.phase = this.phase === "pause-after-forward" ? "backward" : "forward";
        this.turnIndex = this.phase === "forward" ? 0 : FACE_TURNS.length - 1;
        this.elapsed = 0;
        continue;
      }

      if (!this.activeTurn) this.beginTurn();
      const consumed = Math.min(remaining, this.turnDuration - this.elapsed);
      this.elapsed += consumed;
      remaining -= consumed;
      this.applyTurnProgress(this.elapsed / this.turnDuration);
      if (this.elapsed < this.turnDuration) return;
      this.finishTurn();
    }
  }

  beginTurn() {
    const definition = FACE_TURNS[this.turnIndex];
    const angle = this.phase === "forward" ? definition.angle : -definition.angle;
    const pivots = this.cubes.map((cube) => {
      const pivot = new THREE.Group();
      pivot.name = "Pingpong-turn-pivot";
      cube.add(pivot);
      const positions = cube.pieces.filter((piece) => piece !== cube.core)
        .map((piece) => piece.position[definition.axis]);
      const edge = definition.side * Math.max(...positions.map(Math.abs));
      const pieces = cube.pieces.filter((piece) => (
        piece !== cube.core && Math.abs(piece.position[definition.axis] - edge) < 1e-5
      ));
      pieces.forEach((piece) => pivot.attach(piece));
      return { cube, pivot, pieces };
    });
    this.activeTurn = { angle, appliedAngle: 0, pivots };
  }

  applyTurnProgress(progress) {
    const nextAngle = this.activeTurn.angle * Math.min(progress, 1);
    const delta = nextAngle - this.activeTurn.appliedAngle;
    const { axis } = FACE_TURNS[this.turnIndex];
    this.activeTurn.pivots.forEach(({ pivot }) => { pivot.rotation[axis] += delta; });
    this.activeTurn.appliedAngle = nextAngle;
  }

  finishTurn() {
    this.activeTurn.pivots.forEach(({ cube, pivot, pieces }) => {
      pivot.updateMatrixWorld(true);
      pieces.forEach((piece) => {
        cube.attach(piece);
        piece.position.set(...piece.position.toArray().map((value) => Math.round(value * 1e8) / 1e8));
        piece.quaternion.normalize();
      });
      pivot.removeFromParent();
    });
    this.activeTurn = null;
    this.elapsed = 0;

    if (this.phase === "forward" && this.turnIndex === FACE_TURNS.length - 1) {
      this.phase = "pause-after-forward";
    } else if (this.phase === "backward" && this.turnIndex === 0) {
      this.phase = "pause-after-backward";
    } else {
      this.turnIndex += this.phase === "forward" ? 1 : -1;
    }
  }

  dispose() {
    if (this.activeTurn) {
      this.applyTurnProgress(1);
      this.finishTurn();
    }
    super.dispose();
  }
}
