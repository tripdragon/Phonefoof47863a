const pointerTypes = {
  touch: "touch",
};

export class MultitouchEngine {
  activePointers = new Map();
  drawingPointerId = null;
  isMultitouch = false;
  skipTouchUp = false;

  pointerDown(ev) {
    this.activePointers.set(ev.pointerId, ev);

    if (this.activePointers.size > 1) {
      this.isMultitouch = true;
      this.skipTouchUp = true;
      this.drawingPointerId = null;
      return { shouldAbortDrawing: true, shouldStartDrawing: false };
    }

    this.isMultitouch = false;
    this.skipTouchUp = false;
    this.drawingPointerId = ev.pointerId;
    return { shouldAbortDrawing: false, shouldStartDrawing: true };
  }

  pointerMove(ev) {
    this.activePointers.set(ev.pointerId, ev);

    if (this.isMultitouch || this.activePointers.size > 1) {
      return { shouldDraw: false, shouldAbortDrawing: !this.isMultitouch };
    }

    return { shouldDraw: ev.pointerId === this.drawingPointerId, shouldAbortDrawing: false };
  }

  pointerUp(ev) {
    this.activePointers.delete(ev.pointerId);

    const shouldSkipTouchUp = this.skipTouchUp;
    const hasActivePointers = this.activePointers.size > 0;

    if (!hasActivePointers) {
      this.reset();
    }

    return { shouldSkipTouchUp, hasActivePointers };
  }

  reset() {
    this.activePointers.clear();
    this.drawingPointerId = null;
    this.isMultitouch = false;
    this.skipTouchUp = false;
  }

  isTouchPointer(ev) {
    return ev.pointerType === pointerTypes.touch;
  }
}
