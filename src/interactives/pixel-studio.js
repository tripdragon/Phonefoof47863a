const DEFAULT_RESOLUTION = 32;
const DEFAULT_BRUSH_SIZE = 1;
const DEFAULT_SMOOTH_DRAWING = true;
const DISPLAY_SIZE = 512;

const HORSE_NAME_WORD_BANKS = [
  ["Amber", "Autumn", "Azure", "Blazing", "Blue", "Bold", "Bright", "Cinder", "Copper", "Crimson", "Dancing", "Dusty", "Emerald", "Golden", "Grand", "Iron", "Ivory", "Lucky", "Midnight", "Moon", "Noble", "Rapid", "Royal", "Scarlet", "Silver", "Starlit", "Storm", "Summer", "Sun", "Velvet", "Whispering", "Wild"],
  ["Arrow", "Banner", "Beacon", "Breeze", "Charge", "Comet", "Crown", "Dancer", "Dash", "Dream", "Echo", "Ember", "Fable", "Falcon", "Flame", "Fortune", "Glory", "Harbor", "Harmony", "Jubilee", "Legend", "Meadow", "Mirage", "Promise", "Runner", "Shadow", "Song", "Spirit", "Star", "Thunder", "Trail", "Victory"],
  ["Bluff", "Brook", "Canyon", "Creek", "Garden", "Glen", "Harbor", "Heights", "Hollow", "Lagoon", "Manor", "Mesa", "Oasis", "Park", "Ridge", "River", "Springs", "Summit", "Valley", "Vista", "Way", "Wharf"]
];
const MIN_HORSE_NAME_WORDS = 1;
const MAX_HORSE_NAME_WORDS = 10;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createGrid(resolution) {
  return Array.from({ length: resolution }, () => Array(resolution).fill(0));
}

function drawGrid(ctx, grid, showGrid = true) {
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

  if (!showGrid) {
    return;
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

function paintLine(grid, startPoint, endPoint, brushSize) {
  const deltaX = endPoint.x - startPoint.x;
  const deltaY = endPoint.y - startPoint.y;
  const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));

  if (steps === 0) {
    paintAt(grid, startPoint.x, startPoint.y, brushSize);
    return;
  }

  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const interpolatedX = Math.round(startPoint.x + deltaX * progress);
    const interpolatedY = Math.round(startPoint.y + deltaY * progress);
    paintAt(grid, interpolatedX, interpolatedY, brushSize);
  }
}

function pickRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function createRaceHorseFilename() {
  const wordCount = Math.floor(
    Math.random() * (MAX_HORSE_NAME_WORDS - MIN_HORSE_NAME_WORDS + 1)
  ) + MIN_HORSE_NAME_WORDS;
  const words = Array.from({ length: wordCount }, (_, index) => {
    const bank = HORSE_NAME_WORD_BANKS[index % HORSE_NAME_WORD_BANKS.length];
    return pickRandomItem(bank);
  });

  return words.join("-").toLowerCase();
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

          <label class="pixel-studio__toggle" for="pixel-smooth-drawing">
            <span>Smooth drawing</span>
            <input id="pixel-smooth-drawing" type="checkbox" checked />
            <small>Fill skipped cells while dragging.</small>
          </label>

          <button id="pixel-grid-toggle" class="action" type="button" aria-pressed="true">Hide grid</button>
          <button id="pixel-download" class="action" type="button">Download PNG</button>
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
  const smoothDrawingInput = container.querySelector("#pixel-smooth-drawing");
  const gridToggleButton = container.querySelector("#pixel-grid-toggle");
  const downloadButton = container.querySelector("#pixel-download");
  const clearButton = container.querySelector("#pixel-clear");
  const textForm = container.querySelector("#pixel-text-form");
  const textInput = container.querySelector("#pixel-text-input");

  let resolution = DEFAULT_RESOLUTION;
  let brushSize = DEFAULT_BRUSH_SIZE;
  let grid = createGrid(resolution);
  let isDrawing = false;
  let showGrid = true;
  let smoothDrawingEnabled = DEFAULT_SMOOTH_DRAWING;
  let lastPaintedCell = null;

  const render = () => {
    drawGrid(context, grid, showGrid);
  };

  const updateGridToggleLabel = () => {
    gridToggleButton.textContent = showGrid ? "Hide grid" : "Show grid";
    gridToggleButton.setAttribute("aria-pressed", String(showGrid));
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
    const cell = getCellFromEvent(event);
    paintAt(grid, cell.x, cell.y, brushSize);
    lastPaintedCell = cell;
    render();
  };

  const handlePointerMove = (event) => {
    if (!isDrawing) {
      return;
    }

    const cell = getCellFromEvent(event);

    if (smoothDrawingEnabled && lastPaintedCell) {
      paintLine(grid, lastPaintedCell, cell, brushSize);
    } else {
      paintAt(grid, cell.x, cell.y, brushSize);
    }

    lastPaintedCell = cell;
    render();
  };

  const stopDrawing = (event) => {
    isDrawing = false;
    lastPaintedCell = null;
    if (event?.pointerId != null && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const handleBrushChange = (event) => {
    brushSize = Number(event.target.value);
    updateBrushLabel();
  };

  const handleSmoothDrawingChange = (event) => {
    smoothDrawingEnabled = event.target.checked;
  };

  const handleResolutionChange = (event) => {
    resolution = Number(event.target.value);
    grid = createGrid(resolution);
    render();
  };

  const handleGridToggle = () => {
    showGrid = !showGrid;
    updateGridToggleLabel();
    render();
  };

  const handleDownload = () => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportContext = exportCanvas.getContext("2d");

    if (!exportContext) {
      return;
    }

    drawGrid(exportContext, grid, false);

    const link = document.createElement("a");
    link.href = exportCanvas.toDataURL("image/png");
    link.download = `${createRaceHorseFilename()}.png`;
    link.click();
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

  smoothDrawingInput.checked = smoothDrawingEnabled;

  brushInput.addEventListener("input", handleBrushChange);
  smoothDrawingInput.addEventListener("change", handleSmoothDrawingChange);
  resolutionSelect.addEventListener("change", handleResolutionChange);
  gridToggleButton.addEventListener("click", handleGridToggle);
  downloadButton.addEventListener("click", handleDownload);
  clearButton.addEventListener("click", handleClear);
  textForm.addEventListener("submit", handleSubmit);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);

  updateBrushLabel();
  updateGridToggleLabel();
  render();

  return () => {
    brushInput.removeEventListener("input", handleBrushChange);
    smoothDrawingInput.removeEventListener("change", handleSmoothDrawingChange);
    resolutionSelect.removeEventListener("change", handleResolutionChange);
    gridToggleButton.removeEventListener("click", handleGridToggle);
    downloadButton.removeEventListener("click", handleDownload);
    clearButton.removeEventListener("click", handleClear);
    textForm.removeEventListener("submit", handleSubmit);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerup", stopDrawing);
    canvas.removeEventListener("pointerleave", stopDrawing);
    canvas.removeEventListener("pointercancel", stopDrawing);
  };
}
