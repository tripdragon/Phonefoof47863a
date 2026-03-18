
// this replaces CheapPool from superneatlib
// in that it adds even more

// this acts as a scene grapth

// DONT run swap routines in a loop
// need the more complicated for loop walking

import * as THREE from "three";

// export class CheapPool extends Array{
export class SlightlyPriceyPool extends Array{

  selectedIndex = 0;

  rootObject3D;

  // does this work??? since its an array
  constructor({rootObject3D}={}){
    super();
    this.rootObject3D = rootObject3D;
  }
  // constructor() {
  //   super();
  // }
  // 0 to length
  add(...item){
    this.push(...item);
  }
  remove(item){
    const index = this.indexOf(item);
    if (index > -1) this.splice(index, 1);
  }
  clear(){
    this.length = 0;
    this.selectedIndex = 0;
  }

  // goes though the array front 0 and loops
  requestItem(){
    const ii = this.selectedIndex;
    this.selectedIndex++;
    this.selectedIndex = this.selectedIndex % this.length;
    return this[ii];
  }
//   function removeItemAll(arr, value) {
//   var i = 0;
//   while (i < arr.length) {
//     if (arr[i] === value) {
//       arr.splice(i, 1);
//     } else {
//       ++i;
//     }
//   }
//   return arr;
// }
  // 0 to length
  // [a,b,c] to:
  // [b,c,a]
  swapFront(){
    this.swap("front");
    return this;
  }
  // length to 0
  // [a,b,c] to:
  // [c,a,b]
  swapBack(){
    this.swap("back");
    return this;
  }
  swap(side){
    if(this.length < 1){
      console.log("length must be greater than 1");
      return;
    }
    if(side === "front"){
      const aa = this.shift();
      this.push(aa);
    }
    if(side === "back"){
      const aa = this.pop();
      this.unshift(aa);
    }
  }


}