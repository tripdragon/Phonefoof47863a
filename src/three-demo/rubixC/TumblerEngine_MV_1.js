import { FingersAPI } from "./fingers_api/fingersAPI_222.js";

/**
 * Top-level controller for direct manipulation of a completed RubixCubeLike.
 *
 * Notes (MV_1):
 * - The cube must finish constructing its pieces and transitional groups before
 *   this controller is created. This prevents a first touch from selecting an
 *   incomplete side/ring.
 * - Pointer input is delegated to FingersAPI. A drag chooses one rotational
 *   group, follows the finger, and Tumbler magnet-snaps that same group when the
 *   pointer is released.
 * - Pointer Events and `touch-action: none` are used intentionally so the same
 *   path works for a mouse, pen, and one-finger mobile gesture.
 */
export class TumblerEngine_MV_1 extends FingersAPI {
  constructor(options = {}) {
    const cube = options.cube;
    if (!cube?.pieces?.length || !cube?.tGS) {
      throw new Error("TumblerEngine_MV_1 starts only after cube construction is complete.");
    }

    // Construction of FingersAPI starts pointer handling. Calling it here, only
    // after validating the finished cube, defines the engine's start boundary.
    super(options);
    this.started = true;
  }
}

