import * as THREE from "three";

export class FingersAPI {
  constructor({ camera, domElement, scene, controls, cube, markerCount = 96 } = {}) {
    this.camera = camera;
    this.domElement = domElement;
    this.scene = scene;
    this.controls = controls;
    this.cube = cube;
    this.markerCount = markerCount;

    this.raycaster = new THREE.Raycaster();
    this.pointerNdc = new THREE.Vector2();
    this.hitPointPool = [];
    this.activeMarkers = [];
    this.points = [];
    this.maxPoints = 64;
    this.avgWindow = 6;

    this.arrow = null;
    this.arrowOrigin = new THREE.Vector3();
    this.arrowDirection = new THREE.Vector3(1, 0, 0);

    this.activePointerId = null;
    this.selectedPiece = null;

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    this.buildPool();
  }

  buildPool() {
    if (!this.scene) return;
    const markerGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    for (let i = 0; i < this.markerCount; i++) {
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.visible = false;
      this.hitPointPool.push(marker);
      this.scene.add(marker);
    }

    this.arrow = new THREE.ArrowHelper(this.arrowDirection, this.arrowOrigin, 0.01, 0x111111, 0.15, 0.08);
    this.arrow.visible = false;
    this.scene.add(this.arrow);
  }

  beginPointerEvents() {
    if (!this.domElement) return;
    this.domElement.style.touchAction = "none";
    this.domElement.addEventListener("pointerdown", this.onPointerDown);
    this.domElement.addEventListener("pointermove", this.onPointerMove);
    this.domElement.addEventListener("pointerup", this.onPointerUp);
    this.domElement.addEventListener("pointercancel", this.onPointerUp);
    this.domElement.addEventListener("pointerleave", this.onPointerUp);
  }

  onPointerDown(ev) {
    if (this.activePointerId !== null) return;

    const hit = this.raycastPlanes(ev);
    if (!hit) return;

    this.activePointerId = ev.pointerId;
    this.domElement.setPointerCapture?.(ev.pointerId);
    this.controls.enabled = false;

    this.resetGesture();
    this.selectPiece(hit.piece);
    this.addPoint(hit.point);
  }

  onPointerMove(ev) {
    if (this.activePointerId !== ev.pointerId) return;
    const hit = this.raycastPlanes(ev);
    if (!hit) return;

    this.addPoint(hit.point);
  }

  onPointerUp(ev) {
    if (this.activePointerId !== ev.pointerId) return;

    this.activePointerId = null;
    this.controls.enabled = true;
    this.domElement.releasePointerCapture?.(ev.pointerId);
  }

  resetGesture() {
    this.points.length = 0;
    this.activeMarkers.forEach((marker) => {
      marker.visible = false;
    });
    this.activeMarkers.length = 0;
    if (this.arrow) {
      this.arrow.visible = false;
    }
  }

  selectPiece(piece) {
    if (this.selectedPiece && this.selectedPiece !== piece) {
      this.selectedPiece.revertColor();
    }
    this.selectedPiece = piece;
    this.selectedPiece?.highlight({ amp: 0.35 });
  }

  addPoint(point) {
    if (!point) return;

    this.points.push(point.clone());
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }

    const marker = this.hitPointPool[this.activeMarkers.length % this.hitPointPool.length];
    if (marker) {
      marker.position.copy(point);
      marker.visible = true;
      this.activeMarkers.push(marker);
      if (this.activeMarkers.length > this.hitPointPool.length) {
        const oldMarker = this.activeMarkers.shift();
        oldMarker.visible = false;
      }
    }

    this.updateArrow();
  }
const toV = new THREE.Vector3();
  updateArrow() {
    if (!this.arrow) return;
    if (this.points.length < 2) {
      this.arrow.visible = false;
      return;
    }

    this.toV.copy(this.movingAverage(this.points.length - 1));
    const from = this.movingAverage(this.points.length - 2);
    const dir = this.toV.sub(from);
    const len = dir.length();
    if (len <= 1e-5) {
      this.arrow.visible = false;
      return;
    }

    dir.normalize();
    this.arrow.position.copy(from);
    this.arrow.setDirection(dir);
    this.arrow.setLength(Math.max(len, 0.01), 0.15, 0.08);
    this.arrow.visible = true;
  }
  
  const outV = new THREE.Vector3();
  movingAverage(endIndex) {
    //const out = new THREE.Vector3();
    this.outV.set(0,0,0);
    const start = Math.max(0, endIndex - this.avgWindow + 1);
    let count = 0;
    for (let i = start; i <= endIndex; i++) {
      this.outV.add(this.points[i]);
      count++;
    }
    if (count > 0) out.multiplyScalar(1 / count);
    return this.outV;
  }

  raycastPlanes(ev) {
    if (!this.camera || !this.cube || !this.domElement) return null;

    const rect = this.domElement.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    this.pointerNdc.set(x, y);

    const planes = [];
    this.cube.pieces.forEach((piece) => {
      piece.planes.forEach((entry) => {
        if (entry?.plane) planes.push(entry.plane);
      });
    });

    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(planes, false);
    if (!hits.length) return null;

    const firstHit = hits[0];
    const piece = this.findPieceParent(firstHit.object);
    if (!piece) return null;

    return { piece, point: firstHit.point };
  }

  findPieceParent(object) {
    let current = object;
    while (current) {
      if (current.isPiece) return current;
      current = current.parent;
    }
    return null;
  }

  dispose() {
    this.domElement?.removeEventListener("pointerdown", this.onPointerDown);
    this.domElement?.removeEventListener("pointermove", this.onPointerMove);
    this.domElement?.removeEventListener("pointerup", this.onPointerUp);
    this.domElement?.removeEventListener("pointercancel", this.onPointerUp);
    this.domElement?.removeEventListener("pointerleave", this.onPointerUp);

    this.hitPointPool.forEach((marker) => {
      this.scene?.remove(marker);
      marker.geometry?.dispose?.();
      marker.material?.dispose?.();
    });
    this.hitPointPool.length = 0;

    if (this.arrow) {
      this.scene?.remove(this.arrow);
      this.arrow.line?.geometry?.dispose?.();
      this.arrow.line?.material?.dispose?.();
      this.arrow.cone?.geometry?.dispose?.();
      this.arrow.cone?.material?.dispose?.();
      this.arrow = null;
    }
  }
}
