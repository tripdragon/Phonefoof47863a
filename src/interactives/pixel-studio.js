const DEFAULT_RESOLUTION = 32;
const DEFAULT_BRUSH_SIZE = 1;
const DISPLAY_SIZE = 512;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createGrid(resolution) {
  return Array.from({ length: resolution }, () => Array(resolution).fill(0));
}

function drawGrid(ctx, grid) {
  const resolution = grid.length;
  const cellSize = ctx.canvas.width / resolution;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let y = 0; y < resolution; y += 1) {
    for (let x = 0; x < resolution; x += 1) {
      if (!grid[y][x]) {
        continue;
      }

      ctx.fillStyle = "#312e81";
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  ctx.strokeStyle = "rgba(99, 102, 241, 0.16)";
  ctx.lineWidth = 1;

  for (let index = 0; index <= resolution; index += 1) {
    const offset = index * cellSize;
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset, ctx.canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, offset);
    ctx.lineTo(ctx.canvas.width, offset);
    ctx.stroke();
  }
}

function paintAt(grid, x, y, brushSize) {
  const radius = Math.max(0, Math.floor(brushSize) - 1);

  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      const nextX = x + offsetX;
      const nextY = y + offsetY;

      if (!grid[nextY] || typeof grid[nextY][nextX] === "undefined") {
        continue;
      }

      grid[nextY][nextX] = 1;
    }
  }
}

function rasterizeText(grid, text) {
  const resolution = grid.length;
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = resolution;
  offscreenCanvas.height = resolution;
  const offscreenContext = offscreenCanvas.getContext("2d", { willReadFrequently: true });

  offscreenContext.clearRect(0, 0, resolution, resolution);
  offscreenContext.fillStyle = "#ffffff";
  offscreenContext.fillRect(0, 0, resolution, resolution);
  offscreenContext.fillStyle = "#000000";
  offscreenContext.textAlign = "center";
  offscreenContext.textBaseline = "middle";

  const sanitizedText = text.trim().slice(0, 24) || "PIXEL";
  const fontSize = Math.max(6, Math.floor(resolution / Math.max(2.6, sanitizedText.length * 0.36)));
  offscreenContext.font = `700 ${fontSize}px system-ui`;
  offscreenContext.fillText(sanitizedText, resolution / 2, resolution / 2, resolution * 0.92);

  const { data } = offscreenContext.getImageData(0, 0, resolution, resolution);

  for (let y = 0; y < resolution; y += 1) {
    for (let x = 0; x < resolution; x += 1) {
      const alphaIndex = (y * resolution + x) * 4 + 3;
      const redIndex = alphaIndex - 3;
      const hasInk = data[redIndex] < 200 && data[alphaIndex] > 0;
      grid[y][x] = hasInk ? 1 : grid[y][x];
    }
  }
}

export function renderPixelStudio(container) {
  container.innerHTML = `
    <section class="pixel-studio" aria-label="Pixel drawing studio">
      <p class="hero-label">Pixel Studio</p>
      <h1 class="hero-title">Draw and stamp text into a pixel canvas</h1>
      <p class="hero-subtitle">Pick a brush size, choose the canvas resolution, sketch in the center panel, or turn text into blocky pixel art.</p>

      <div class="pixel-studio__panel">
        <div class="pixel-studio__controls" role="group" aria-label="Canvas controls">
          <label class="pixel-studio__field">
            <span>Brush size</span>
            <input id="pixel-brush-size" type="range" min="1" max="5" step="1" value="${DEFAULT_BRUSH_SIZE}" />
            <output id="pixel-brush-size-output">${DEFAULT_BRUSH_SIZE} px blocks</output>
          </label>

          <label class="pixel-studio__field">
            <span>Canvas resolution</span>
            <select id="pixel-resolution">
              <option value="16">16 × 16</option>
              <option value="24">24 × 24</option>
              <option value="32" selected>32 × 32</option>
              <option value="48">48 × 48</option>
              <option value="64">64 × 64</option>
            </select>
          </label>

          <button id="pixel-clear" class="action" type="button">Clear canvas</button>
        </div>

        <div class="pixel-studio__canvas-wrap">
          <canvas id="pixel-canvas" class="pixel-studio__canvas" width="${DISPLAY_SIZE}" height="${DISPLAY_SIZE}" aria-label="Pixel drawing canvas"></canvas>
        </div>

        <form id="pixel-text-form" class="pixel-studio__text-form">
          <label class="pixel-studio__field pixel-studio__field--wide">
            <span>Text to pixel-render</span>
            <input id="pixel-text-input" type="text" maxlength="24" placeholder="Type text to stamp into the canvas" />
          </label>
          <button class="action" type="submit">Send to canvas</button>
        </form>
      </div>
    </section>
  `;

  const canvas = container.querySelector("#pixel-canvas");
  const context = canvas.getContext("2d");
  const brushInput = container.querySelector("#pixel-brush-size");
  const brushOutput = container.querySelector("#pixel-brush-size-output");
  const resolutionSelect = container.querySelector("#pixel-resolution");
  const clearButton = container.querySelector("#pixel-clear");
  const textForm = container.querySelector("#pixel-text-form");
  const textInput = container.querySelector("#pixel-text-input");

  let resolution = DEFAULT_RESOLUTION;
  let brushSize = DEFAULT_BRUSH_SIZE;
  let grid = createGrid(resolution);
  let isDrawing = false;

  const render = () => {
    drawGrid(context, grid);
  };

  const updateBrushLabel = () => {
    brushOutput.textContent = `${brushSize} px block${brushSize === 1 ? "" : "s"}`;
  };

  const getCellFromEvent = (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const localX = (event.clientX - rect.left) * scaleX;
    const localY = (event.clientY - rect.top) * scaleY;
    const cellSize = canvas.width / resolution;

    return {
      x: clamp(Math.floor(localX / cellSize), 0, resolution - 1),
      y: clamp(Math.floor(localY / cellSize), 0, resolution - 1),
    };
  };

  const handlePointerDown = (event) => {
    isDrawing = true;
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = getCellFromEvent(event);
    paintAt(grid, x, y, brushSize);
    render();
  };

  const handlePointerMove = (event) => {
    if (!isDrawing) {
      return;
    }

    const { x, y } = getCellFromEvent(event);
    paintAt(grid, x, y, brushSize);
    render();
  };

  const stopDrawing = (event) => {
    isDrawing = false;
    if (event?.pointerId != null && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const handleBrushChange = (event) => {
    brushSize = Number(event.target.value);
    updateBrushLabel();
  };

  const handleResolutionChange = (event) => {
    resolution = Number(event.target.value);
    grid = createGrid(resolution);
    render();
  };

  const handleClear = () => {
    grid = createGrid(resolution);
    render();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    rasterizeText(grid, textInput.value);
    render();
  };

  brushInput.addEventListener("input", handleBrushChange);
  resolutionSelect.addEventListener("change", handleResolutionChange);
  clearButton.addEventListener("click", handleClear);
  textForm.addEventListener("submit", handleSubmit);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);

  updateBrushLabel();
  render();

  return () => {
    brushInput.removeEventListener("input", handleBrushChange);
    resolutionSelect.removeEventListener("change", handleResolutionChange);
    clearButton.removeEventListener("click", handleClear);
    textForm.removeEventListener("submit", handleSubmit);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerup", stopDrawing);
    canvas.removeEventListener("pointerleave", stopDrawing);
    canvas.removeEventListener("pointercancel", stopDrawing);
  };
}
