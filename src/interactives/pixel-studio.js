import { mountPixelStudio } from "./pixel-studio/controller";

export function renderPixelStudio(container, options = {}) {
  return mountPixelStudio(container, options);
}

export { mountPixelStudio } from "./pixel-studio/controller";
export { createPixelStudioMarkup } from "./pixel-studio/view";
export { renderPixelStudioToolButtons } from "./pixel-studio/tool-buttons";
