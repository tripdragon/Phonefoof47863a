export const DEFAULT_RESOLUTION = 32;
export const DEFAULT_BRUSH_SIZE = 1;
export const DEFAULT_SMOOTH_DRAWING = true;
export const DISPLAY_SIZE = 512;
export const PLAYBACK_INTERVAL_MS = 250;
export const DEFAULT_PAINT_COLOR = "#312e81";

export class PaintAction {
  constructor({ resolution, brushSize, color }) {
    this.type = "paint";
    this.resolution = resolution;
    this.brushSize = brushSize;
    this.color = color;
    this.coords = [];
  }
}

export class DrawingSession {
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

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createGrid(resolution) {
  return Array.from({ length: resolution }, () => Array(resolution).fill(null));
}

export function drawGrid(ctx, grid, showGrid = true) {
  const resolution = grid.length;
  const cellSize = ctx.canvas.width / resolution;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let y = 0; y < resolution; y += 1) {
    for (let x = 0; x < resolution; x += 1) {
      const cellColor = grid[y][x];
      if (!cellColor) {
        continue;
      }

      ctx.fillStyle = cellColor;
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

export function paintAt(grid, x, y, brushSize, color = DEFAULT_PAINT_COLOR) {
  const radius = Math.max(0, Math.floor(brushSize) - 1);
  const paintedCoords = [];

  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      const nextX = x + offsetX;
      const nextY = y + offsetY;

      if (!grid[nextY] || typeof grid[nextY][nextX] === "undefined") {
        continue;
      }

      grid[nextY][nextX] = color;
      paintedCoords.push({ x: nextX, y: nextY });
    }
  }

  return paintedCoords;
}

export function paintLine(grid, startPoint, endPoint, brushSize, color = DEFAULT_PAINT_COLOR) {
  const paintedCoords = [];
  const deltaX = endPoint.x - startPoint.x;
  const deltaY = endPoint.y - startPoint.y;
  const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));

  if (steps === 0) {
    return paintAt(grid, startPoint.x, startPoint.y, brushSize, color);
  }

  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const interpolatedX = Math.round(startPoint.x + deltaX * progress);
    const interpolatedY = Math.round(startPoint.y + deltaY * progress);
    paintedCoords.push(...paintAt(grid, interpolatedX, interpolatedY, brushSize, color));
  }

  return paintedCoords;
}

function pickRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function createRaceHorseFilename() {
  const wordCount = Math.floor(
    Math.random() * (MAX_HORSE_NAME_WORDS - MIN_HORSE_NAME_WORDS + 1)
  ) + MIN_HORSE_NAME_WORDS;
  const words = Array.from({ length: wordCount }, (_, index) => {
    const bank = HORSE_NAME_WORD_BANKS[index % HORSE_NAME_WORD_BANKS.length];
    return pickRandomItem(bank);
  });

  return words.join("-").toLowerCase();
}

export function rasterizeText(grid, text) {
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
      grid[y][x] = hasInk ? DEFAULT_PAINT_COLOR : grid[y][x];
    }
  }
}
