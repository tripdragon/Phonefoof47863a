/** Owns and advances the engines used by the RubixWai demonstration. */
export class Demostrator {
  constructor() {
    this.engines = [];
  }

  addEngine(engine) {
    if (!this.engines.includes(engine)) this.engines.push(engine);
    return engine;
  }

  update(deltaSeconds) {
    this.engines.forEach((engine) => {
      if (engine.active) engine.update(deltaSeconds);
    });
  }

  dispose() {
    this.engines.forEach((engine) => engine.dispose());
    this.engines = [];
  }
}
