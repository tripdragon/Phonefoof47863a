import { RubixWaiScene } from "./RubixWaiScene.js";

export class RubixWaiPage {
  constructor(container) {
    this.container = container;
    this.container.innerHTML = `
      <article class="rubixwai-page">
        <header class="rubixwai-header">
          <p class="rubixwai-kicker">THREE.JS OBJECT STUDY</p>
          <h1>rubixwai</h1>
          <p>Orbit the camera by dragging. Scroll to zoom and right-click to pan around RubixMega.</p>
        </header>
        <div class="rubixwai-stage" aria-label="Interactive three-dimensional RubixMega cube"></div>
        <p class="rubixwai-hint"><span aria-hidden="true">↻</span> Drag to inspect all six traditional colors</p>
      </article>
    `;
    this.scene = new RubixWaiScene(this.container.querySelector(".rubixwai-stage"));
  }

  dispose() {
    this.scene.dispose();
  }
}

export function renderRubixWaiRoute(container) {
  const page = new RubixWaiPage(container);
  return () => page.dispose();
}
