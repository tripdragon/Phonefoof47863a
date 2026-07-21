// import * as THREE from "three";
import { 
  Vector2, Vector3, Group, 
  Matrix4, Quaternion
  // AxesHelper
} from "three";

import { Piece } from "./Piece.js";
import { CoreObject3D } from "./coreObject3D.js";
import { colors } from "./constants.js";
import { CheapPool } from "superneatlib";
import { PiecesGroup } from "./PiecesGroup.js";
// import { AxisHelperWithLetters } from "superneatlib";
import { ThickAxesHelper } from "./utilites/thickAxesHelper.js";
// import { torqueGroup, measureTorqueOnPiece } from "./math.js";



export class RubixCubeLike extends Group {
  pieces = [];

  static EPSILON = 1e-5;

  core;
  // Object3D, was used for attaching the pieces to an invisible object
  // to transform with, replacing for matrix routines perhaps

  tGS = {
    // transitionalGroups
    // sides and rings of cube
    // the pieces all keep swapping out
    // so dont cache this in a reference
    // the concept of visual world space applies to the positions of groups
    // like what is top for example
    /*
      for (const key in tGS) {
      console.log(key, tGS[key]);
      }
    */
    // in seeking we only need the first 6, not the ring systems
    // to find their up y vector and crossproduct

    // faces / cornersets
    // also now store the axis used for rotations
    // in respect to the Cube Space not world space
    top: new PiecesGroup("top","side",new Vector3(0,1,0)),        // +y
    bottom: new PiecesGroup("bottom","side",new Vector3(0,-1,0)),     // -y
    left: new PiecesGroup("left","side",new Vector3(-1,0,0)),  // -x
    right: new PiecesGroup("right","side",new Vector3(1,0,0)), // +x
    back: new PiecesGroup("back","side",new Vector3(0,0,1)),   // +z
    front: new PiecesGroup("front","side",new Vector3(0,0,-1)),  // -z

    // 8-piece middle slices (no visible center cubie)
    // the Axis here are the center visual rotations not the visual align of the pieces
    ringHorizontal: new PiecesGroup("ringHorizontal","ring",new Vector3(0,1,0)),     // x ~= 0
    ringVertical: new PiecesGroup("ringVertical","ring",new Vector3(1,0,0)),     // z ~= 0
    ringBow: new PiecesGroup("ringBow","ring",new Vector3(0,0,1)) // y ~= 0
  }

  getPiecesGroup(name){
    // we refish cause its pointless if everything is out of sync
    // no that "should" break it when its moving
    // // this.refishGroups();
    // so just refish before or after
    return this.tGS[name];
  }

  constructor() {
    super();
    this.buildTopLevel();
    this.buildCenterLevel();
    this.buildBottomLevel();
    this.buildCore();
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
    // after every spin, 3 sides have produced new groups for 
    // their respective sides,
    // so calling this on all and always after a spin is a nessesary
    // computations for anything to work
    this.clearAllFish();

    this.fishTop();
    this.fishBottom();

    this.fishLeft();
    this.fishRight();
    this.fishBack();
    this.fishFront();

    this.fishRingHorizontal();
    this.fishRingVertical();
    this.fishRingBow();
  }

  fishTop() {
    //this.clearGroup(this.tGS.top);
    this.tGS.top.clear();
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
    this.tGS.right.clear();
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
      if (this.gtZero(x.position.z)) {
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
        console.log("i",x.whichType);
      }
    });
    this.tGS.ringHorizontal.assignCenter(this.core);
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
    this.tGS.ringVertical.assignCenter(this.core);
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
    this.tGS.ringBow.assignCenter(this.core);
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
    //p1.rotation.x = Math.PI * -0.5;
    p1.quaternion.setFromAxisAngle( new Vector3( 1, 0, 0 ), Math.PI * -0.5 );

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

  buildCore(){
    this.core = new CoreObject3D();
    this.add(this.core);
  }

  // 
  showCenterNormals(){
    this.pieces.forEach(x=>{
        //const axesHelper = new AxesHelper( 2 );
        // x.add( axesHelper );
      // const yy = new AxisHelperWithLetters({size:2});
      if(x.whichType === "center"){
        const yy = new ThickAxesHelper({length : 1.4, radius : 0.05});
        x.add( yy );
        x.visuals.normal = yy;
      }
    });
  }

  detachAll(){
    this.pieces.forEach(x=>{
      this.attach(x);
    })
  }

  updateMatrixPieces(){
    this.pieces.forEach(x=>{
      x.updateMatrix();
    });
  }

  colorAllPieces(colorHex = 0xfffaaa){
    if (!this.pieces?.length) return;
    this.pieces.forEach((x) => {
      x.setColorOverAll(colorHex);
    });
  }

  colorAllPiecesRandom(colorHex = 0xffffff){
    if (!this.pieces?.length) return;
    const cc = Math.random();
    this.pieces.forEach((x) => {
      x.setColorOverAll(cc * colorHex);
    });
  }



  getSelectedPieceGroups(piece){
    // ff.cube.tGS.top === groups[0]
    // returns [groups references]
    return Object.values(this.tGS).filter((group) => group?.includes?.(piece));
  }


  /*
    =================
    Transforms on groups like Torque
    Obsolute maybe
    group has a .axis now
  */
  // axis = new Vector3(0,0,0);

  // getAxisFromName(name){
  //   // switch(name){
  //   //   name :"left" 
  //   //   break;
  //   // }

  //   if(name === "left"){
  //     this.axis.set(-1,0,0);
  //   }
  //   else if(name === "right"){
  //     this.axis.set(1,0,0);
  //   }
  //   else if(name === "top"){
  //     this.axis.set(0,1,0);
  //   }
  //   else if(name === "bottom"){
  //     this.axis.set(0,-1,0);
  //   }
  //   else if(name === "front"){
  //     this.axis.set(0,0,-1);
  //   }
  //   else if(name === "back"){
  //     this.axis.set(0,0,1);
  //   }
  //   else if(name === "ringHorizontal"){
  //     this.axis.set(0,1,0);
  //   }
  //   else if(name === "ringVertical"){
  //     this.axis.set(1,0,0);
  //   }
  //   else if(name === "ringBow"){
  //     this.axis.set(0,0,1);
  //   }
  //   return this.axis;
  // }


  m = new Matrix4();
  t = new Vector3();
  q = new Quaternion()
  s = new Vector3(1, 1, 1);

  torqueV = new Vector3();

  
  // spinGroup({name,axis,pivot, angle}) {
  spinGroupByName({name,deltaAngle}) {
    const yy = this.getPiecesGroup(name);
    this.spinGroup({group:yy,deltaAngle});
  }
  spinGroup({group,deltaAngle}) {
    // this type is a accumulation rotation from the angle in
    // the accumulation is from the .applyMatrix
    // meaning the only way to get a "smooth" would be a physics
    // friction or dampenning into its value

    // before running call cube.refishGroups()
    // call cube.getPiecesGroup() before running
    // this is run in a loop
    // has no magnet, so handle that outside as well



    const m = this.m;
    const t = this.t;
    const q = this.q;
    const s = this.s;
    // const axis = this.getAxisFromName(name);
    


    // pivot would actually be found within the group center
    // const pivot = new Vector3(0,0,0);
    // const pivot = new Vector3(px, py, pz);
    // const axis = new Vector3(-1, 0, 0); // already normalized
    // const angle = Math.PI / 4;
    // const angle = 1.2;
    // const angle = Math.PI / 2;

    // const yy = this.getPiecesGroup(name);
    const axis = group.axis;

    const pivot = group.center.position;
    // is this "poping" in place, and who can you send a smooth?
    // q.identity()
    q.setFromAxisAngle(axis, deltaAngle);

    // translation = pivot - (rotation * pivot)
    t.copy(pivot).applyQuaternion(q).sub(pivot).negate();

    m.compose(t, q, s);

    group.forEach(x=>{
      // x.rotation.set(1,-1,1)
      // x.position.set(0,0,1);
      x.applyMatrix4(m);
    });
  }



  /*

    const f = {x:-0.0,y:-0.1,z:0.0};
    const l = {x:0,y:0,z:1};
    function jhhv() {
      //f.y += -0.01;
      magicCube.torqueGroup({name:"left",leverV:l,forceV:f});
    }
    setInterval(jhhv,100)

  */
  torqueGroupByName({name,leverV,forceV}){
    const yy = this.getPiecesGroup(name);
    this.torqueGroup({group:yy,leverV,forceV})
  }
  torqueGroup({group,leverV,forceV}){
    // turns a group from the force of a torque and a lever
    // does not respect the groups axis by design since the lever is its
    // own special vector
    // Originally built to handle finger direction turns¿
    // NOTE: for perfect force effect, it should be perpendicular 90° to the lever


    const t = this.t;
    const tq = this.torqueV;
    const q = this.q;
    const s = this.s;
    const m = this.m;

    // const yy = this.getPiecesGroup(name);

    
    // does this work for rings?
    const pivot = group.center.position;


    tq.crossVectors(forceV,leverV);

    const deltaAngle = tq.length();

    // axis is torque here
    q.setFromAxisAngle(tq.normalize(), deltaAngle);
    
    // translation = pivot - (rotation * pivot)
    t.copy(pivot).applyQuaternion(q).sub(pivot).negate();

    m.compose(t, q, s);

    group.forEach(x=>{
      x.applyMatrix4(m);
    });
  }

  // axisV = new Vector3();
  // measureTorqueOnPiece({name,leverV,forceV}){
  //   /*
  //     this does not visually turn anything, its role is to give back a
  //     vector and an angle dot product to know if an axis should have been locked to
  //     an axis spin
  //   */

  //   // all the same as torqueGroup
  //   const t = this.t;
  //   const tq = this.torqueV;
  //   const q = this.q;
  //   const s = this.s;
  //   const m = this.m;
  //   const yy = this.getPiecesGroup(name);
  //   const axisW = this.axisV;

  //   axisW.copy(yy.axis);

  //   // might need to ABS the lever and axis here
  //   // just to get a reading not a heading
  //   // also where is lever length???
  //   // this does not read as proper torque yet

  //   tq.crossVectors(forceV,leverV);
  //   const deltaAngle = tq.length();
  //   q.setFromAxisAngle(tq.normalize(), deltaAngle);
  //   axisW.applyQuaternion(q);

  //   // need dot product
  //   const dot = yy.axis.dot(axisW);
    

    
  // }


  
}
