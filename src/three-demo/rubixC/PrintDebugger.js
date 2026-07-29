import { Group } from "three";

/**
 * One switch for RubixC's development visuals and its small, in-scene status readout.
 */
export class PrintDebugger {
  printToScreen = [];

  constructor({ host, enabled = true } = {}) {
    this.enabled = enabled;
    this.visuals = new Group();
    this.visuals.name = "RubixC debug visuals";
    this.visuals.visible = enabled;

    this.element = document.createElement("button");
    this.element.type = "button";
    this.element.className = "rubixc-print-debugger";
    this.element.setAttribute("aria-label", "Toggle RubixC debug visuals");
    this.element.addEventListener("click", this.toggle);
    host?.appendChild(this.element);
    this.print();
  }

  toggle = () => {
    this.setEnabled(!this.enabled);
  };

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    this.visuals.visible = this.enabled;
    this.print();
  }

  add(...objects) {
    this.visuals.add(...objects.filter(Boolean));
    this.print();
    return objects[0];
  }

  print(message = "VISUAL DEBUG") {
    const state = this.enabled ? "ON" : "OFF";
    this.element.dataset.enabled = String(this.enabled);
    this.element.setAttribute("aria-pressed", String(this.enabled));
    this.element.replaceChildren(
      ...[message, ...this.printToScreen, `${state} // CLICK TO TOGGLE`].map((line) => {
        const span = document.createElement("span");
        span.textContent = String(line);
        return span;
      }),
    );
  }

  dispose() {
    this.element.removeEventListener("click", this.toggle);
    this.element.remove();
    this.visuals.removeFromParent();
  }
}
