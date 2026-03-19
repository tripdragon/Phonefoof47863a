const DEFAULT_RESOLUTION = 32;
const DEFAULT_BRUSH_SIZE = 1;
const DEFAULT_SMOOTH_DRAWING = true;
const DISPLAY_SIZE = 512;
const PLAYBACK_INTERVAL_MS = 250;
const PAINT_COLOR = "#312e81";

class PaintAction {
  constructor({ resolution, brushSize, color }) {
    this.type = "paint";
    this.resolution = resolution;
    this.brushSize = brushSize;
    this.color = color;
    this.coords = [];
  }
}

class DrawingSession {
  constructor() {
    this.actions = [];
  }
}

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

      ctx.fillStyle = PAINT_COLOR;
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
  const paintedCoords = [];

  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      const nextX = x + offsetX;
      const nextY = y + offsetY;

      if (!grid[nextY] || typeof grid[nextY][nextX] === "undefined") {
        continue;
      }

      grid[nextY][nextX] = 1;
      paintedCoords.push({ x: nextX, y: nextY });
    }
  }

  return paintedCoords;
}

function paintLine(grid, startPoint, endPoint, brushSize) {
  const paintedCoords = [];
  const deltaX = endPoint.x - startPoint.x;
  const deltaY = endPoint.y - startPoint.y;
  const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));

  if (steps === 0) {
    return paintAt(grid, startPoint.x, startPoint.y, brushSize);
  }

  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const interpolatedX = Math.round(startPoint.x + deltaX * progress);
    const interpolatedY = Math.round(startPoint.y + deltaY * progress);
    paintedCoords.push(...paintAt(grid, interpolatedX, interpolatedY, brushSize));
  }

  return paintedCoords;
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
      <h1 class="hero-title">Draw, record, and replay pixel sessions</h1>
      <p class="hero-subtitle">Pick a brush size, choose the canvas resolution, sketch in the center panel, stamp text into the canvas, or record touch-down points for playback.</p>

      <div class="pixel-studio__panel">
        <div class="pixel-studio__workspace">
          <div class="pixel-studio__controls" role="group" aria-label="Canvas controls">
            <div class="pixel-studio__control-card pixel-studio__control-card--inputs">
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
            </div>

            <div class="pixel-studio__control-card pixel-studio__control-card--actions">
              <p class="pixel-studio__section-label">Canvas actions</p>
              <div class="pixel-studio__button-row" role="group" aria-label="Canvas actions">
                <button id="pixel-grid-toggle" class="pixel-studio__button pixel-studio__button--secondary" type="button" aria-pressed="true">Hide grid</button>
                <button id="pixel-download" class="pixel-studio__button pixel-studio__button--secondary" type="button">Download PNG</button>
                <button id="pixel-clear" class="pixel-studio__button pixel-studio__button--ghost" type="button">Clear canvas</button>
              </div>
            </div>
          </div>

          <div class="pixel-studio__recording" role="group" aria-label="Recording controls">
            <div class="pixel-studio__recording-header">
              <div>
                <p class="pixel-studio__section-label">Recording</p>
                <output id="pixel-recording-status" class="pixel-studio__recording-status" aria-live="polite">Recorder idle. 0 touch-down items stored.</output>
              </div>
              <button id="pixel-record-toggle" class="pixel-studio__button pixel-studio__button--record" type="button" aria-pressed="false">Start recording</button>
            </div>
            <div class="pixel-studio__button-row pixel-studio__button-row--recording" role="group" aria-label="Playback controls">
              <button id="pixel-playback" class="pixel-studio__button pixel-studio__button--secondary" type="button">Play back</button>
              <button id="pixel-step" class="pixel-studio__button pixel-studio__button--ghost" type="button">Step each</button>
            </div>
          </div>
        </div>

        <div class="pixel-studio__canvas-wrap">
          <canvas id="pixel-canvas" class="pixel-studio__canvas" width="${DISPLAY_SIZE}" height="${DISPLAY_SIZE}" aria-label="Pixel drawing canvas"></canvas>
        </div>

        <form id="pixel-text-form" class="pixel-studio__text-form">
          <label class="pixel-studio__field pixel-studio__field--wide">
            <span>Text to pixel-render</span>
            <input id="pixel-text-input" type="text" maxlength="24" placeholder="Type text to stamp into the canvas" />
          </label>
          <button class="pixel-studio__button pixel-studio__button--secondary" type="submit">Send to canvas</button>
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
  const recordToggleButton = container.querySelector("#pixel-record-toggle");
  const playbackButton = container.querySelector("#pixel-playback");
  const stepButton = container.querySelector("#pixel-step");
  const recordingStatus = container.querySelector("#pixel-recording-status");
  const textForm = container.querySelector("#pixel-text-form");
  const textInput = container.querySelector("#pixel-text-input");

  let resolution = DEFAULT_RESOLUTION;
  let brushSize = DEFAULT_BRUSH_SIZE;
  let grid = createGrid(resolution);
  let isDrawing = false;
  let showGrid = true;
  let smoothDrawingEnabled = DEFAULT_SMOOTH_DRAWING;
  let lastPaintedCell = null;
  let isRecording = false;
  let drawingSession = new DrawingSession();
  let currentPaintAction = null;
  let playbackIndex = 0;
  let playbackTimerId = null;

  const render = () => {
    drawGrid(context, grid, showGrid);
  };

  const stopPlayback = () => {
    if (playbackTimerId) {
      window.clearInterval(playbackTimerId);
      playbackTimerId = null;
    }
  };

  const applyPaintAction = (action) => {
    if (!action || action.type !== "paint" || action.resolution !== resolution) {
      return false;
    }

    action.coords.forEach(({ x, y }) => {
      paintAt(grid, x, y, action.brushSize);
    });
    render();
    return true;
  };

  const resetPlaybackGrid = () => {
    grid = createGrid(resolution);
    render();
  };

  const updateRecordingStatus = () => {
    const actionCount = drawingSession.actions.length;
    const itemLabel = `${actionCount} paint action${actionCount === 1 ? "" : "s"}`;

    if (isRecording) {
      recordingStatus.textContent = `Recording live. ${itemLabel} stored for ${resolution} × ${resolution}.`;
      return;
    }

    if (!actionCount) {
      recordingStatus.textContent = "Recorder idle. 0 paint actions stored.";
      return;
    }

    if (playbackTimerId) {
      recordingStatus.textContent = `Playing back action ${Math.min(playbackIndex, actionCount)} of ${actionCount}.`;
      return;
    }

    recordingStatus.textContent = `Recorder idle. ${itemLabel} stored. Next step: ${Math.min(playbackIndex + 1, actionCount)}.`;
  };

  const updateRecordButton = () => {
    const buttonLabel = isRecording ? "Stop recording" : "Start recording";
    recordToggleButton.textContent = buttonLabel;
    recordToggleButton.setAttribute("aria-pressed", String(isRecording));
    recordToggleButton.setAttribute("aria-label", `${buttonLabel} pixel session capture`);
    recordToggleButton.classList.toggle("is-recording", isRecording);
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
    stopPlayback();
    updateRecordingStatus();
    isDrawing = true;
    canvas.setPointerCapture(event.pointerId);
    const cell = getCellFromEvent(event);
    const paintedCoords = paintAt(grid, cell.x, cell.y, brushSize);
    lastPaintedCell = cell;

    if (isRecording) {
      currentPaintAction = new PaintAction({
        resolution,
        brushSize,
        color: PAINT_COLOR,
      });
      currentPaintAction.coords.push(...paintedCoords);
      drawingSession.actions.push(currentPaintAction);
      playbackIndex = drawingSession.actions.length;
      updateRecordingStatus();
    }

    render();
  };

  const handlePointerMove = (event) => {
    if (!isDrawing) {
      return;
    }

    const cell = getCellFromEvent(event);
    const paintedCoords = smoothDrawingEnabled && lastPaintedCell
      ? paintLine(grid, lastPaintedCell, cell, brushSize)
      : paintAt(grid, cell.x, cell.y, brushSize);

    if (currentPaintAction) {
      currentPaintAction.coords.push(...paintedCoords);
    }

    lastPaintedCell = cell;
    render();
  };

  const stopDrawing = (event) => {
    isDrawing = false;
    lastPaintedCell = null;
    currentPaintAction = null;
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
    stopPlayback();
    resolution = Number(event.target.value);
    grid = createGrid(resolution);
    drawingSession = new DrawingSession();
    currentPaintAction = null;
    playbackIndex = 0;
    updateRecordingStatus();
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
    stopPlayback();
    grid = createGrid(resolution);
    playbackIndex = 0;
    render();
    updateRecordingStatus();
  };

  const handleRecordToggle = () => {
    isRecording = !isRecording;

    if (isRecording) {
      stopPlayback();
      drawingSession = new DrawingSession();
      currentPaintAction = null;
      playbackIndex = 0;
    }

    updateRecordButton();
    updateRecordingStatus();
  };

  const handlePlayback = () => {
    stopPlayback();

    if (!drawingSession.actions.length) {
      updateRecordingStatus();
      return;
    }

    resetPlaybackGrid();
    playbackIndex = 0;
    updateRecordingStatus();

    playbackTimerId = window.setInterval(() => {
      const action = drawingSession.actions[playbackIndex];

      if (!action) {
        stopPlayback();
        updateRecordingStatus();
        return;
      }

      applyPaintAction(action);
      playbackIndex += 1;
      updateRecordingStatus();

      if (playbackIndex >= drawingSession.actions.length) {
        stopPlayback();
        updateRecordingStatus();
      }
    }, PLAYBACK_INTERVAL_MS);
  };

  const handleStep = () => {
    stopPlayback();

    if (!drawingSession.actions.length) {
      updateRecordingStatus();
      return;
    }

    if (playbackIndex === 0) {
      resetPlaybackGrid();
    }

    const action = drawingSession.actions[playbackIndex];

    if (!action) {
      playbackIndex = 0;
      resetPlaybackGrid();
      updateRecordingStatus();
      return;
    }

    if (applyPaintAction(action)) {
      playbackIndex += 1;
    }

    updateRecordingStatus();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    stopPlayback();
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
  recordToggleButton.addEventListener("click", handleRecordToggle);
  playbackButton.addEventListener("click", handlePlayback);
  stepButton.addEventListener("click", handleStep);
  textForm.addEventListener("submit", handleSubmit);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointerleave", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);

  updateBrushLabel();
  updateGridToggleLabel();
  updateRecordButton();
  updateRecordingStatus();
  render();

  return () => {
    stopPlayback();
    brushInput.removeEventListener("input", handleBrushChange);
    smoothDrawingInput.removeEventListener("change", handleSmoothDrawingChange);
    resolutionSelect.removeEventListener("change", handleResolutionChange);
    gridToggleButton.removeEventListener("click", handleGridToggle);
    downloadButton.removeEventListener("click", handleDownload);
    clearButton.removeEventListener("click", handleClear);
    recordToggleButton.removeEventListener("click", handleRecordToggle);
    playbackButton.removeEventListener("click", handlePlayback);
    stepButton.removeEventListener("click", handleStep);
    textForm.removeEventListener("submit", handleSubmit);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerup", stopDrawing);
    canvas.removeEventListener("pointerleave", stopDrawing);
    canvas.removeEventListener("pointercancel", stopDrawing);
  };
}
