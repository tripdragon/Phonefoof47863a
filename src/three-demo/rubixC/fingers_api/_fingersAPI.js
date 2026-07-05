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
    this.projectedPointPool = [];
    this.activeMarkers = [];
    this.activeProjectedMarkers = [];
    this.points = [];
    this.projectedPoints = [];
    this.maxPoints = 64;
    this.avgWindow = 6;

    this.arrow = null;
    this.faceArrow = null;
    this.faceGridHelper = null;
    this.faceMathPlane = null;
    this.arrowOrigin = new THREE.Vector3();
    this.arrowDirection = new THREE.Vector3(1, 0, 0);
    this.faceNormal = new THREE.Vector3();
    this.tmpProjectedPoint = new THREE.Vector3();
    this.normalMatrix = new THREE.Matrix3();
    this.toV = new THREE.Vector3();
    this.outV = new THREE.Vector3();

    this.activePointerId = null;
    this.selectedPiece = null;
    this.highlightedPieces = new Set();

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    this.buildPool();
  }

  buildPool() {
    if (!this.scene) return;
    const markerGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const projectedMarkerMat = new THREE.MeshBasicMaterial({ color: 0xff8c00 });
    for (let i = 0; i < this.markerCount; i++) {
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.visible = false;
      this.hitPointPool.push(marker);
      this.scene.add(marker);

      const projectedMarker = new THREE.Mesh(markerGeo, projectedMarkerMat);
      projectedMarker.visible = false;
      this.projectedPointPool.push(projectedMarker);
      this.scene.add(projectedMarker);
    }

    this.arrow = new THREE.ArrowHelper(this.arrowDirection, this.arrowOrigin, 0.01, 0x111111, 0.15, 0.08);
    this.arrow.visible = false;
    this.scene.add(this.arrow);

    this.faceArrow = new THREE.ArrowHelper(this.arrowDirection, this.arrowOrigin, 0.6, 0x2d7fff, 0.18, 0.1);
    this.faceArrow.visible = false;
    this.scene.add(this.faceArrow);

    this.faceGridHelper = new THREE.GridHelper(3, 12, 0x2d7fff, 0x2d7fff);
    this.faceGridHelper.visible = false;
    this.scene.add(this.faceGridHelper);
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

    this.prepareFaceDebug(hit);
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
    this.projectedPoints.length = 0;
    this.activeMarkers.forEach((marker) => {
      marker.visible = false;
    });
    this.activeMarkers.length = 0;
    this.activeProjectedMarkers.forEach((marker) => {
      marker.visible = false;
    });
    this.activeProjectedMarkers.length = 0;
    if (this.arrow) {
      this.arrow.visible = false;
    }
    if (this.faceArrow) {
      this.faceArrow.visible = false;
    }
    if (this.faceGridHelper) {
      this.faceGridHelper.visible = false;
    }
    this.faceMathPlane = null;
  }

  prepareFaceDebug(hit) {
    if (!hit?.normal || !hit?.point) return;

    this.faceNormal.copy(hit.normal).normalize();
    const faceOrigin = hit.point.clone().addScaledVector(this.faceNormal, 0.03);
    this.faceMathPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(this.faceNormal, faceOrigin);

    if (this.faceArrow) {
      this.faceArrow.position.copy(faceOrigin);
      this.faceArrow.setDirection(this.faceNormal);
      this.faceArrow.setLength(0.6, 0.18, 0.1);
      this.faceArrow.visible = true;
    }

    if (this.faceGridHelper) {
      this.faceGridHelper.position.copy(faceOrigin);
      this.faceGridHelper.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.faceNormal);
      this.faceGridHelper.visible = true;
    }
  }

  selectPiece(piece) {
    this.clearGroupHighlights();
    this.selectedPiece = piece;

    if (!this.selectedPiece) return;

    this.selectedPiece.highlight({ amp: 0.35 });
    this.highlightedPieces.add(this.selectedPiece);

    const containingGroups = this.findGroupsForPiece(this.selectedPiece);
    containingGroups.forEach((group) => {
      group.forEach((groupPiece) => {
        if (!groupPiece || groupPiece === this.selectedPiece) return;
        groupPiece.highlight({ amp: 0.4 });
        this.highlightedPieces.add(groupPiece);
      });
    });
  }

  findGroupsForPiece(piece) {
    if (!piece || !this.cube?.tGS) return [];

    return Object.values(this.cube.tGS).filter((group) =>
      typeof group?.some === "function" ? group.some((candidate) => candidate === piece) : false
    );
  }

  clearGroupHighlights() {
    this.highlightedPieces.forEach((piece) => {
      piece?.revertColor?.();
    });
    this.highlightedPieces.clear();
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

    if (this.faceMathPlane) {
      this.faceMathPlane.projectPoint(point, this.tmpProjectedPoint);
      this.projectedPoints.push(this.tmpProjectedPoint.clone());
      if (this.projectedPoints.length > this.maxPoints) {
        this.projectedPoints.shift();
      }

      const projectedMarker =
        this.projectedPointPool[this.activeProjectedMarkers.length % this.projectedPointPool.length];
      if (projectedMarker) {
        projectedMarker.position.copy(this.tmpProjectedPoint);
        projectedMarker.visible = true;
        this.activeProjectedMarkers.push(projectedMarker);
        if (this.activeProjectedMarkers.length > this.projectedPointPool.length) {
          const oldProjectedMarker = this.activeProjectedMarkers.shift();
          oldProjectedMarker.visible = false;
        }
      }
    }

    this.updateArrow();
  }
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

  movingAverage(endIndex) {
    //const out = new THREE.Vector3();
    this.outV.set(0,0,0);
    const start = Math.max(0, endIndex - this.avgWindow + 1);
    let count = 0;
    for (let i = start; i <= endIndex; i++) {
      this.outV.add(this.points[i]);
      count++;
    }
    if (count > 0) this.outV.multiplyScalar(1 / count);
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

    let normal = null;
    if (firstHit.face) {
      this.normalMatrix.getNormalMatrix(firstHit.object.matrixWorld);
      normal = firstHit.face.normal.clone().applyNormalMatrix(this.normalMatrix).normalize();
    }

    return { piece, point: firstHit.point, normal };
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

    this.projectedPointPool.forEach((marker) => {
      this.scene?.remove(marker);
      marker.geometry?.dispose?.();
      marker.material?.dispose?.();
    });
    this.projectedPointPool.length = 0;

    if (this.arrow) {
      this.scene?.remove(this.arrow);
      this.arrow.line?.geometry?.dispose?.();
      this.arrow.line?.material?.dispose?.();
      this.arrow.cone?.geometry?.dispose?.();
      this.arrow.cone?.material?.dispose?.();
      this.arrow = null;
    }

    if (this.faceArrow) {
      this.scene?.remove(this.faceArrow);
      this.faceArrow.line?.geometry?.dispose?.();
      this.faceArrow.line?.material?.dispose?.();
      this.faceArrow.cone?.geometry?.dispose?.();
      this.faceArrow.cone?.material?.dispose?.();
      this.faceArrow = null;
    }

    if (this.faceGridHelper) {
      this.scene?.remove(this.faceGridHelper);
      this.faceGridHelper.geometry?.dispose?.();
      this.faceGridHelper.material?.dispose?.();
      this.faceGridHelper = null;
    }

    this.clearGroupHighlights();
    this.selectedPiece = null;
  }
}
