/** Base controller for demonstrations that can operate on one or more cubes. */
export class Engine {
  constructor() {
    this.cubes = [];
    this.active = false;
  }

  addCube(cube) {
    if (!this.cubes.includes(cube)) this.cubes.push(cube);
    return cube;
  }

  removeCube(cube) {
    this.cubes = this.cubes.filter((candidate) => candidate !== cube);
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  update() {}

  dispose() {
    this.deactivate();
    this.cubes = [];
  }
}
