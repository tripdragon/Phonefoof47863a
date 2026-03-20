import { DEFAULT_BRUSH_SIZE, DISPLAY_SIZE } from "./shared";
import { renderPixelStudioToolButtons } from "./tool-buttons";

const DEFAULT_COPY = {
  eyebrow: "Pixel Studio",
  title: "Draw, record, and replay pixel sessions",
  subtitle:
    "Pick a brush size, choose the canvas resolution, sketch in the center panel, stamp text into the canvas, or record drawing actions for playback.",
  toolsLabel: "Tools",
  toolsHint: "Use smooth paint for connected strokes, then manage the canvas with the quick actions.",
  actionsLabel: "Canvas actions",
  actionsGroupLabel: "Canvas actions",
  recordingLabel: "Recording",
  playbackLabel: "Playback tools",
  playbackGroupLabel: "Playback controls",
  sessionLabel: "Drawing session",
  sessionHint: "Track each stroke you draw and compare it against common Japanese characters.",
  sessionButtonLabel: "Start drawing session",
  sessionIdle: "Session idle. Press start to count live strokes.",
  sessionActive: "Session active. Stroke count updates live while you draw.",
  sessionCountLabel: "Lines drawn",
  matchesLabel: "Stroke count matches",
  matchesHint: "Characters shown here share the same stroke count as your live session.",
  matchesEmpty: "Draw a few lines to see matching kana and kanji.",
  clearButtonLabel: "Clear canvas",
};

export function createPixelStudioMarkup(copy = DEFAULT_COPY) {
  const {
    eyebrow,
    title,
    subtitle,
    toolsLabel,
    toolsHint,
    actionsLabel,
    actionsGroupLabel,
    recordingLabel,
    playbackLabel,
    playbackGroupLabel,
    sessionLabel,
    sessionHint,
    sessionButtonLabel,
    sessionIdle,
    sessionCountLabel,
    matchesLabel,
    matchesHint,
    matchesEmpty,
    clearButtonLabel,
  } = { ...DEFAULT_COPY, ...copy };

  return `
    <section class="pixel-studio" aria-label="Pixel drawing studio">
      <p class="hero-label">${eyebrow}</p>
      <h1 class="hero-title">${title}</h1>
      <p class="hero-subtitle">${subtitle}</p>

      <div class="pixel-studio__panel">
        <div class="pixel-studio__workspace">
          <div class="pixel-studio__controls" role="group" aria-label="Canvas controls">
            <div class="pixel-studio__control-card pixel-studio__control-card--inputs">
              <div class="pixel-studio__tools-header">
                <p class="pixel-studio__section-label">${toolsLabel}</p>
                <p class="pixel-studio__tools-hint">${toolsHint}</p>
              </div>

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

              <label class="pixel-studio__toggle pixel-studio__toggle--toolbar" for="pixel-smooth-drawing">
                <span>Smooth paint</span>
                <input id="pixel-smooth-drawing" type="checkbox" checked />
                <small>Fill skipped cells while dragging.</small>
              </label>
            </div>

            ${renderPixelStudioToolButtons({
              sectionLabel: actionsLabel,
              groupLabel: actionsGroupLabel,
              buttons: [
                { id: "pixel-grid-toggle", label: "Hide grid", variant: "secondary", pressed: true },
                { id: "pixel-download", label: "Download PNG", variant: "secondary" },
                { id: "pixel-clear", label: clearButtonLabel, variant: "ghost" },
              ],
            })}
          </div>

          <div class="pixel-studio__recording" role="group" aria-label="Recording controls">
            <div class="pixel-studio__recording-header">
              <div>
                <p class="pixel-studio__section-label">${recordingLabel}</p>
                <output id="pixel-recording-status" class="pixel-studio__recording-status" aria-live="polite">Recorder idle. 0 paint actions stored.</output>
              </div>
              <button id="pixel-record-toggle" class="pixel-studio__button pixel-studio__button--record" type="button" aria-pressed="false">Start recording</button>
            </div>
            ${renderPixelStudioToolButtons({
              sectionLabel: playbackLabel,
              groupLabel: playbackGroupLabel,
              rowClassName: "pixel-studio__button-row--recording",
              buttons: [
                { id: "pixel-playback", label: "Play back", variant: "secondary" },
                { id: "pixel-step", label: "Step each", variant: "ghost" },
              ],
            })}
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

        <section class="pixel-studio__session" aria-label="${sessionLabel}">
          <div class="pixel-studio__session-header">
            <div>
              <p class="pixel-studio__section-label">${sessionLabel}</p>
              <p class="pixel-studio__tools-hint">${sessionHint}</p>
            </div>
            <button id="pixel-session-toggle" class="pixel-studio__button pixel-studio__button--secondary" type="button" aria-pressed="false">${sessionButtonLabel}</button>
          </div>
          <div class="pixel-studio__session-stats">
            <div class="pixel-studio__session-count">
              <span>${sessionCountLabel}</span>
              <output id="pixel-stroke-count" aria-live="polite">0</output>
            </div>
            <output id="pixel-session-status" class="pixel-studio__recording-status" aria-live="polite">${sessionIdle}</output>
          </div>
          <div class="pixel-studio__matches">
            <div class="pixel-studio__tools-header">
              <p class="pixel-studio__section-label">${matchesLabel}</p>
              <p class="pixel-studio__tools-hint">${matchesHint}</p>
            </div>
            <div id="pixel-character-matches" class="pixel-studio__match-grid" role="list">
              <p class="pixel-studio__match-empty">${matchesEmpty}</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  `;
}
