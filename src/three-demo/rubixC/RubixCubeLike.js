import * as THREE from "three";
import { Piece } from "./Piece.js";
import { colors } from "./constants.js";
import { CheapPool } from "superneatlib";
import { PiecesGroup } from "./PiecesGroup.js";

export class RubixCubeLike extends THREE.Group {
  pieces = [];

  static EPSILON = 1e-5;

  // transitionalGroups
  // sides and rings of cube
  tGS = {
    // faces / cornersets
    top: new PiecesGroup(),        // +y
    bottom: new PiecesGroup(),     // -y

    left: new PiecesGroup(),  // -x
    right: new PiecesGroup(), // +x
    back: new PiecesGroup(),   // +z
    front: new PiecesGroup(),  // -z

    // 8-piece middle slices (no visible center cubie)
    ringHorizontal: new PiecesGroup(),     // x ~= 0
    ringVertical: new PiecesGroup(),     // z ~= 0
    ringBow: new PiecesGroup() // y ~= 0
  };

  constructor() {
    super();
    this.buildTopLevel();
    this.buildCenterLevel();
    this.buildBottomLevel();
    this.refishGroups();
  }

  nearZero(n, eps = RubixCubeLike.EPSILON) {
    return Math.abs(n) <= eps;
  }

  gtZero(n, eps = RubixCubeLike.EPSILON) {
    return n > eps;
  }

  ltZero(n, eps = RubixCubeLike.EPSILON) {
    return n < -eps;
  }

  clearGroup(group) {
    group.length = 0;
  }

  clearAllFish() {
    Object.values(this.tGS).forEach(group => {
      this.clearGroup(group);
    });
  }

  refishGroups() {
    this.clearAllFish();

    this.fishTop();
    this.fishBottom();

    this.fishLeft();
    this.fishRight();
    this.fisBack();
    this.fishFront();

    this.fishRingHorizontal();
    this.fishRingVertical();
    this.fishRingBow();
  }

  fishTop() {
    //this.clearGroup(this.tGS.top);
    this.tGS.clear();
    this.pieces.forEach((x) => {
      if (this.gtZero(x.position.y)) {
        this.tGS.top.add(x);
      }
    });
  }

  fishBottom() {
    //this.clearGroup(this.tGS.bottom);
    this.tGS.bottom.clear();
    this.pieces.forEach((x) => {
      if (this.ltZero(x.position.y)) {
        this.tGS.bottom.add(x);
      }
    });
  }

  fishLeft() {
    //this.clearGroup(this.tGS.leftFront);
    this.tGS.left.clear();
    this.pieces.forEach((x) => {
      if (this.ltZero(x.position.x)) {
        this.tGS.left.add(x);
      }
    });
  }

  fishRight() {
    //this.clearGroup(this.tGS.right);
    this.tGS.right();
    this.pieces.forEach((x) => {
      if (this.gtZero(x.position.x)) {
        this.tGS.right.add(x);
      }
    });
  }

  fishFront() {
    //this.clearGroup(this.tGS.front);
    this.tGS.front.clear();
    this.pieces.forEach((x) => {
      if (this.ltZero(x.position.z)) {
        this.tGS.front.add(x);
      }
    });
  }

  fishBack() {
   // this.clearGroup(this.tGS.rightBack);
    this.tGS.back.clear();
    this.pieces.forEach((x) => {
      if (this.gtZero(this.gtZero(x.position.z)) {
        this.tGS.back.add(x);
      }
    });
  }

  // middle vertical slice where x is effectively 0
  fishRingHorizontal() {
    //this.clearGroup(this.tGS.slice1);
    this.tGS.ringHorizontal.clear();
    this.pieces.forEach((x) => {
      if (this.nearZero(x.position.y)) {
        this.tGS.ringHorizontal.add(x);
      }
    });
  }

  // middle depth slice where z is effectively 0
  fishRingVertical() {
    //this.clearGroup(this.tGS.slice2);
    this.tGS.ringVertical.clear();
    this.pieces.forEach((x) => {
      if (this.nearZero(x.position.x)) {
        this.tGS.ringVertical.add(x);
      }
    });
  }

  // center ring where y is effectively 0
  fishRingBow() {
    //this.clearGroup(this.tGS.sliceCenter);
    this.tGS.ringBow.clear();
    this.pieces.forEach((x) => {
      if (this.nearZero(x.position.z)) {
        this.tGS.ringBow.add(x);
      }
    });
  }

  buildTopLevel() {
    const p0 = new Piece({ colors: [colors.w], debug: true });
    this.add(p0);
    this.pieces.push(p0);
    p0.position.y = 0.5;

    const p1 = new Piece({ colors: [colors.w, colors.b] });
    this.add(p1);
    this.pieces.push(p1);
    p1.position.z = -0.5;
    p1.position.y = 0.5;

    const p2 = new Piece({ colors: [colors.w, colors.b, colors.o] });
    this.add(p2);
    this.pieces.push(p2);
    p2.position.z = -0.5;
    p2.position.x = -0.5;
    p2.position.y = 0.5;

    const p3 = new Piece({ colors: [colors.w, colors.o] });
    this.add(p3);
    this.pieces.push(p3);
    p3.position.x = -0.5;
    p3.rotation.y = Math.PI * 0.5;
    p3.position.y = 0.5;

    const p4 = new Piece({ colors: [colors.w, colors.o, colors.g] });
    this.add(p4);
    this.pieces.push(p4);
    p4.position.z = 0.5;
    p4.position.x = -0.5;
    p4.rotation.y = Math.PI * 0.5;
    p4.position.y = 0.5;

    const p5 = new Piece({ colors: [colors.w, colors.g] });
    this.add(p5);
    this.pieces.push(p5);
    p5.position.z = 0.5;
    p5.rotation.y = Math.PI;
    p5.position.y = 0.5;

    const p6 = new Piece({ colors: [colors.w, colors.g, colors.r] });
    this.add(p6);
    this.pieces.push(p6);
    p6.position.z = 0.5;
    p6.position.x = 0.5;
    p6.rotation.y = Math.PI;
    p6.position.y = 0.5;

    const p7 = new Piece({ colors: [colors.w, colors.r] });
    this.add(p7);
    this.pieces.push(p7);
    p7.position.x = 0.5;
    p7.rotation.y = Math.PI * 2.0 * 0.75;
    p7.position.y = 0.5;

    const p8 = new Piece({ colors: [colors.w, colors.r, colors.b] });
    this.add(p8);
    this.pieces.push(p8);
    p8.position.z = -0.5;
    p8.position.x = 0.5;
    p8.rotation.y = Math.PI * 2.0 * 0.75;
    p8.position.y = 0.5;
  }

  buildCenterLevel() {
    const p1 = new Piece({ colors: [colors.b], debug: true });
    this.add(p1);
    this.pieces.push(p1);
    p1.rotation.x = Math.PI * -0.5;
    p1.position.z = -0.5;

    const p2 = new Piece({ colors: [colors.b, colors.o], debug: true });
    this.add(p2);
    this.pieces.push(p2);
    p2.rotation.x = -Math.PI;
    p2.rotation.y = Math.PI * 0.5;
    p2.rotation.z = Math.PI * 0.5;
    p2.position.x = -0.5;
    p2.position.z = -0.5;

    const p3 = new Piece({ colors: [colors.o], debug: true });
    this.add(p3);
    this.pieces.push(p3);
    p3.rotation.z = -Math.PI * 2 * 0.75;
    p3.position.x = -0.5;

    const p4 = new Piece({ colors: [colors.o, colors.g], debug: true });
    this.add(p4);
    this.pieces.push(p4);
    p4.rotation.x = -Math.PI;
    p4.rotation.y = 0;
    p4.rotation.z = Math.PI * 0.5;
    p4.position.x = -0.5;
    p4.position.z = 0.5;

    const p5 = new Piece({ colors: [colors.g], debug: true });
    this.add(p5);
    this.pieces.push(p5);
    p5.rotation.x = -Math.PI * 2 * 0.75;
    p5.position.z = 0.5;

    const p6 = new Piece({ colors: [colors.g, colors.r], debug: true });
    this.add(p6);
    this.pieces.push(p6);
    p6.rotation.x = Math.PI;
    p6.rotation.y = Math.PI * 2 * 0.75;
    p6.rotation.z = Math.PI * 0.5;
    p6.position.x = 0.5;
    p6.position.y = 0;
    p6.position.z = 0.5;

    const p7 = new Piece({ colors: [colors.r], debug: true });
    this.add(p7);
    this.pieces.push(p7);
    p7.rotation.z = Math.PI * 2 * 0.75;
    p7.position.x = 0.5;
    window.spindebug = p7;
    window.posdebug = p7;

    const p8 = new Piece({ colors: [colors.r, colors.b], debug: true });
    this.add(p8);
    this.pieces.push(p8);
    p8.rotation.x = -Math.PI;
    p8.rotation.y = Math.PI;
    p8.rotation.z = Math.PI * 0.5;
    p8.position.x = 0.5;
    p8.position.y = 0;
    p8.position.z = -0.5;
  }

  buildBottomLevel() {
    const p0 = new Piece({ colors: [colors.y], debug: true });
    this.add(p0);
    this.pieces.push(p0);
    p0.position.y = -0.5;
    p0.rotation.z = Math.PI;
    window.spindebug = p0;

    const p1 = new Piece({ colors: [colors.y, colors.b] });
    this.add(p1);
    this.pieces.push(p1);
    p1.position.z = -0.5;
    p1.position.y = -0.5;
    p1.rotation.z = Math.PI;

    const p2 = new Piece({ colors: [colors.y, colors.o, colors.b] });
    this.add(p2);
    this.pieces.push(p2);
    p2.position.z = -0.5;
    p2.position.x = -0.5;
    p2.position.y = -0.5;
    p2.rotation.x = Math.PI * 0.5;
    p2.rotation.y = Math.PI * 0.5;
    p2.rotation.z = Math.PI * 0.5;

    const p3 = new Piece({ colors: [colors.y, colors.o] });
    this.add(p3);
    this.pieces.push(p3);
    p3.position.x = -0.5;
    p3.rotation.y = Math.PI * 0.5;
    p3.rotation.z = -Math.PI;
    p3.position.y = -0.5;

    const p4 = new Piece({ colors: [colors.y, colors.g, colors.o] });
    this.add(p4);
    this.pieces.push(p4);
    p4.position.z = 0.5;
    p4.position.x = -0.5;
    p4.position.y = -0.5;
    p4.rotation.x = 0;
    p4.rotation.y = -Math.PI;
    p4.rotation.z = Math.PI;

    const p5 = new Piece({ colors: [colors.y, colors.g] });
    this.add(p5);
    this.pieces.push(p5);
    p5.position.z = 0.5;
    p5.position.y = -0.5;
    p5.rotation.x = 0;
    p5.rotation.y = Math.PI;
    p5.rotation.z = Math.PI;

    const p6 = new Piece({ colors: [colors.y, colors.r, colors.g] });
    this.add(p6);
    this.pieces.push(p6);
    p6.position.x = 0.5;
    p6.position.y = -0.5;
    p6.position.z = 0.5;
    p6.rotation.x = Math.PI;
    p6.rotation.y = Math.PI * 2 * 0.75;
    p6.rotation.z = 0;

    const p7 = new Piece({ colors: [colors.y, colors.r] });
    this.add(p7);
    this.pieces.push(p7);
    p7.position.x = 0.5;
    p7.position.y = -0.5;
    p7.rotation.x = 0;
    p7.rotation.y = -Math.PI * 0.5;
    p7.rotation.z = Math.PI;

    const p8 = new Piece({ colors: [colors.y, colors.b, colors.r] });
    this.add(p8);
    this.pieces.push(p8);
    p8.position.x = 0.5;
    p8.position.y = -0.5;
    p8.position.z = -0.5;
    p8.rotation.x = 0;
    p8.rotation.y = 0;
    p8.rotation.z = Math.PI;

    window.spindebug = p8;
    window.posdebug = p8;
  }
                          }
