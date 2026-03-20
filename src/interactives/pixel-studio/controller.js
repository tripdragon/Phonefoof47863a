import {
  clamp,
  createGrid,
  createRaceHorseFilename,
  DEFAULT_BRUSH_SIZE,
  DEFAULT_PAINT_COLOR,
  DEFAULT_RESOLUTION,
  DEFAULT_SMOOTH_DRAWING,
  drawGrid,
  DrawingSession,
  paintAt,
  paintLine,
  PaintAction,
  PLAYBACK_INTERVAL_MS,
  rasterizeText,
} from "./shared";
import { JAPANESE_CHARACTER_STROKES } from "./character-strokes";
import { createPixelStudioMarkup } from "./view";

export function mountPixelStudio(container, options = {}) {
  container.innerHTML = createPixelStudioMarkup(options.copy);

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
  const sessionStatus = container.querySelector("#pixel-session-status");
  const strokeCountOutput = container.querySelector("#pixel-stroke-count");
  const characterMatches = container.querySelector("#pixel-character-matches");
  const bestGuess = container.querySelector("#pixel-best-guess");

  let resolution = options.initialResolution ?? DEFAULT_RESOLUTION;
  let brushSize = options.initialBrushSize ?? DEFAULT_BRUSH_SIZE;
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
  let sessionActive = true;
  let liveStrokeCount = 0;
  const characterDatabase = options.characterDatabase ?? JAPANESE_CHARACTER_STROKES;
  const copy = {
    sessionIdle: "New session ready. Stroke count updates while you draw.",
    sessionActive: "Session active. Stroke count updates live while you draw.",
    matchesEmpty: "Draw a few lines to see matching kana and kanji.",
    bestGuessEmpty: "Draw on the canvas to generate a best-guess character.",
    ...options.copy,
  };
  const templateResolution = 24;
  const templateCache = new Map();

  const createEmptyGrid = (size) => Array.from({ length: size }, () => Array(size).fill(0));

  const rasterizeCharacterTemplate = (character) => {
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = templateResolution;
    offscreenCanvas.height = templateResolution;
    const offscreenContext = offscreenCanvas.getContext("2d", { willReadFrequently: true });

    offscreenContext.clearRect(0, 0, templateResolution, templateResolution);
    offscreenContext.fillStyle = "#ffffff";
    offscreenContext.fillRect(0, 0, templateResolution, templateResolution);
    offscreenContext.fillStyle = "#000000";
    offscreenContext.textAlign = "center";
    offscreenContext.textBaseline = "middle";
    offscreenContext.font = `700 ${Math.floor(templateResolution * 0.72)}px system-ui`;
    offscreenContext.fillText(character, templateResolution / 2, templateResolution / 2, templateResolution * 0.9);

    const { data } = offscreenContext.getImageData(0, 0, templateResolution, templateResolution);
    const template = createEmptyGrid(templateResolution);

    for (let y = 0; y < templateResolution; y += 1) {
      for (let x = 0; x < templateResolution; x += 1) {
        const pixelIndex = (y * templateResolution + x) * 4;
        template[y][x] = data[pixelIndex] < 200 ? 1 : 0;
      }
    }

    return template;
  };

  const getTemplateForCharacter = (character) => {
    if (!templateCache.has(character)) {
      templateCache.set(character, rasterizeCharacterTemplate(character));
    }

    return templateCache.get(character);
  };

  const normalizeGrid = (sourceGrid, size) => {
    const points = [];

    for (let y = 0; y < sourceGrid.length; y += 1) {
      for (let x = 0; x < sourceGrid[y].length; x += 1) {
        if (sourceGrid[y][x]) {
          points.push({ x, y });
        }
      }
    }

    if (!points.length) {
      return createEmptyGrid(size);
    }

    const bounds = points.reduce((accumulator, point) => ({
      minX: Math.min(accumulator.minX, point.x),
      minY: Math.min(accumulator.minY, point.y),
      maxX: Math.max(accumulator.maxX, point.x),
      maxY: Math.max(accumulator.maxY, point.y),
    }), {
      minX: sourceGrid.length,
      minY: sourceGrid.length,
      maxX: 0,
      maxY: 0,
    });

    const croppedWidth = Math.max(1, bounds.maxX - bounds.minX + 1);
    const croppedHeight = Math.max(1, bounds.maxY - bounds.minY + 1);
    const scale = Math.max(croppedWidth, croppedHeight) / Math.max(1, size - 4);
    const offsetX = Math.floor((size - Math.round(croppedWidth / scale)) / 2);
    const offsetY = Math.floor((size - Math.round(croppedHeight / scale)) / 2);
    const normalizedGrid = createEmptyGrid(size);

    points.forEach((point) => {
      const normalizedX = clamp(
        Math.round((point.x - bounds.minX) / scale) + offsetX,
        0,
        size - 1
      );
      const normalizedY = clamp(
        Math.round((point.y - bounds.minY) / scale) + offsetY,
        0,
        size - 1
      );
      normalizedGrid[normalizedY][normalizedX] = 1;
    });

    return normalizedGrid;
  };

  const scoreTemplateMatch = (normalizedGrid, templateGrid) => {
    let intersection = 0;
    let union = 0;

    for (let y = 0; y < normalizedGrid.length; y += 1) {
      for (let x = 0; x < normalizedGrid[y].length; x += 1) {
        const sampleValue = normalizedGrid[y][x];
        const templateValue = templateGrid[y][x];

        if (sampleValue && templateValue) {
          intersection += 1;
        }

        if (sampleValue || templateValue) {
          union += 1;
        }
      }
    }

    return union ? intersection / union : 0;
  };

  const renderBestGuess = () => {
    if (!bestGuess) {
      return;
    }

    const normalizedGrid = normalizeGrid(grid, templateResolution);
    const filledCells = normalizedGrid.flat().reduce((sum, value) => sum + value, 0);

    if (!filledCells) {
      bestGuess.innerHTML = `<p class="pixel-studio__match-empty">${copy.bestGuessEmpty}</p>`;
      return;
    }

    const guess = characterDatabase
      .map((entry) => ({
        ...entry,
        score: scoreTemplateMatch(normalizedGrid, getTemplateForCharacter(entry.character)),
      }))
      .sort((left, right) => right.score - left.score)[0];

    const confidence = Math.round(guess.score * 100);

    bestGuess.innerHTML = `
      <div class="pixel-studio__guess-character" aria-hidden="true">${guess.character}</div>
      <div class="pixel-studio__guess-copy">
        <p class="pixel-studio__guess-title">${guess.name}</p>
        <p class="pixel-studio__guess-meta">${guess.type} · ${guess.strokeCount} strokes</p>
        <p class="pixel-studio__guess-confidence">Template match confidence: ${confidence}%</p>
      </div>
    `;
  };

  resolutionSelect.value = String(resolution);
  brushInput.value = String(brushSize);
  smoothDrawingInput.checked = smoothDrawingEnabled;

  const render = () => {
    drawGrid(context, grid, showGrid);
  };

  const renderCharacterMatches = () => {
    if (!characterMatches) {
      return;
    }

    const matches = liveStrokeCount > 0
      ? characterDatabase.filter((entry) => entry.strokeCount === liveStrokeCount)
      : [];

    if (!matches.length) {
      const emptyMessage = liveStrokeCount > 0
        ? `No saved kana or kanji found with ${liveStrokeCount} strokes.`
        : copy.matchesEmpty;
      characterMatches.innerHTML = `<p class="pixel-studio__match-empty">${emptyMessage}</p>`;
      renderBestGuess();
      return;
    }

    characterMatches.innerHTML = matches
      .map(
        ({ character, name, type, strokeCount }) => `
          <article class="pixel-studio__match-card" role="listitem" aria-label="${character} ${name}">
            <span class="pixel-studio__match-character">${character}</span>
            <span class="pixel-studio__match-name">${name}</span>
            <span class="pixel-studio__match-meta">${type} · ${strokeCount} strokes</span>
          </article>
        `
      )
      .join("");
    renderBestGuess();
  };

  const updateSessionStatus = () => {
    if (!sessionStatus || !strokeCountOutput) {
      return;
    }

    strokeCountOutput.textContent = String(liveStrokeCount);
    sessionStatus.textContent = sessionActive
      ? `${copy.sessionActive} ${liveStrokeCount} line${liveStrokeCount === 1 ? "" : "s"} tracked.`
      : copy.sessionIdle;
    renderCharacterMatches();
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
      if (!grid[y] || typeof grid[y][x] === "undefined") {
        return;
      }

      grid[y][x] = action.color;
    });
    render();
    return true;
  };

  const resetPlaybackGrid = () => {
    grid = createGrid(resolution);
    render();
    renderBestGuess();
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
      recordingStatus.textContent = `Playing back action ${Math.min(playbackIndex + 1, actionCount)} of ${actionCount}.`;
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
    const paintedCoords = paintAt(grid, cell.x, cell.y, brushSize, DEFAULT_PAINT_COLOR);
    lastPaintedCell = cell;

    if (sessionActive) {
      liveStrokeCount += 1;
      updateSessionStatus();
    }

    if (isRecording) {
      currentPaintAction = new PaintAction({
        resolution,
        brushSize,
        color: DEFAULT_PAINT_COLOR,
      });
      currentPaintAction.coords.push(...paintedCoords);
      drawingSession.actions.push(currentPaintAction);
      playbackIndex = drawingSession.actions.length;
      updateRecordingStatus();
    }

    render();
    renderBestGuess();
  };

  const handlePointerMove = (event) => {
    if (!isDrawing) {
      return;
    }

    const cell = getCellFromEvent(event);
    const paintedCoords = smoothDrawingEnabled && lastPaintedCell
      ? paintLine(grid, lastPaintedCell, cell, brushSize, currentPaintAction?.color ?? DEFAULT_PAINT_COLOR)
      : paintAt(grid, cell.x, cell.y, brushSize, currentPaintAction?.color ?? DEFAULT_PAINT_COLOR);

    if (currentPaintAction) {
      currentPaintAction.coords.push(...paintedCoords);
    }

    lastPaintedCell = cell;
    render();
    renderBestGuess();
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
    sessionActive = true;
    liveStrokeCount = 0;
    updateRecordingStatus();
    updateSessionStatus();
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
    sessionActive = true;
    liveStrokeCount = 0;
    render();
    updateRecordingStatus();
    updateSessionStatus();
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
    renderBestGuess();
  };

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
  updateSessionStatus();
  render();
  renderBestGuess();

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
