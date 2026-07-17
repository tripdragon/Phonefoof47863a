import * as THREE from "three";

export class CoreObject3D extends THREE.Object3D {
  isPiece = false;
  whichType = "core";
  
  constructor() {
    super();
  }

    
}
