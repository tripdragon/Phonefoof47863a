import { CheapPool } from "superneatlib";

import { 
  Vector2, Vector3
} from "three";


export class PiecesGroup extends CheapPool {
  center = null; // should not be null
  isType; // ring side
  
  // used during plucker or tumble or torque rotations
  // see Cube for more details maybe
  axis = new Vector3();

  constructor(name="?",type="",axis=new Vector3()) {
    super();
    this.name = name;
    this.isType = type;
    this.axis.copy(axis);
  }

  add(item) {
    super.add(item);

    // bad way to do this
    /*
      The idea being since the pieces constantly change out
      we need to just dump them in again
      but rings would have over lapping race condition centers
      that are not 0,0,0

    */
    if (item.whichType === "center" && this.isType === "side") {
    // if (item.whichType === "center") {
      this.center = item;
    }

    // used for rings
    // if(this.isType === "ring")
    // if(item.whichType === "core"){
    //   this.center = item;
    // }
  }

  assignCenter(object3D){
    this.center = object3D;
  }

}
