import { CheapPool } from "superneatlib";

export class PiecesGroup extends CheapPool {
  center;

  constructor() {
    super();
  }

  add(item) {
    super.add(item);
    if (item.whichType === "center") {
      this.center = item;
    }
  }
}
