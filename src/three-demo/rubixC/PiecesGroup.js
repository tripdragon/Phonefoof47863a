import { CheapPool } from "superneatlib";

import { 
  Vector2, Vector3
} from "three";


export class PiecesGroup extends CheapPool {
  center = null;
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
    if (item.whichType === "center" && this.isType === "side") {
      this.center = item;
    }
    // used for rings
    // if(this.isType === "ring")
    // if(item.whichType === "core"){
    //   this.center = item;
    // }
  }
}
