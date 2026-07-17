import { CheapPool } from "superneatlib";

export class PiecesGroup extends CheapPool {
  center = null;
  isType; // ring side
  constructor(name="?",type="") {
    super();
    this.name = name;
    this.isType = type;
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
