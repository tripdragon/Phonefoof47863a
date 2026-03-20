import { DEFAULT_BRUSH_SIZE, DISPLAY_SIZE } from "./shared";
import { renderPixelStudioToolButtons } from "./tool-buttons";

const DEFAULT_COPY = {
  eyebrow: "Pixel Studio",
  title: "Draw, record, and replay pixel sessions",
  subtitle:
    "Pick a brush size, choose the canvas resolution, sketch in the center panel, stamp text into the canvas, or record drawing actions for playback.",
  explainerLabel: "About this canvas",
  toolsLabel: "Tools",
  toolsHint: "Use smooth paint for connected strokes, then manage the canvas with the quick actions.",
  actionsLabel: "Canvas actions",
  actionsGroupLabel: "Canvas actions",
  recordingLabel: "Recording",
  playbackLabel: "Playback tools",
  playbackGroupLabel: "Playback controls",
  sessionLabel: "Drawing session",
  sessionHint: "Track each stroke you draw and compare it against common Japanese characters.",
  sessionIdle: "New session ready. Stroke count updates while you draw.",
  sessionActive: "Session active. Stroke count updates live while you draw.",
  sessionCountLabel: "Lines drawn",
  matchesLabel: "Stroke count matches",
  matchesHint: "Characters shown here share the same stroke count as your live session.",
  matchesEmpty: "Draw a few lines to see matching kana and kanji.",
  bestGuessLabel: "Best guess",
  bestGuessHint: "Template matching compares your drawing with saved character silhouettes and surfaces the closest match.",
  bestGuessFilterLabel: "Filters",
  bestGuessFilterHint: "Use the filters to limit results by live line count and character set.",
  bestGuessEmpty: "Draw on the canvas to generate a best-guess character.",
  databaseLabel: "Character database",
  databaseHint: "Load the saved kana and kanji grouped by line count for quick browsing.",
  databaseButtonLabel: "Load database",
  databaseEmpty: "Load the database to browse every saved character by line count.",
  clearButtonLabel: "Clear canvas",
};

function createDisclosureCard({ label, title, hint = "", content, className = "" }) {
  const summaryId = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-summary`;

  return `
    <details class="pixel-studio__disclosure ${className}" aria-labelledby="${summaryId}">
      <summary class="pixel-studio__disclosure-summary" id="${summaryId}">
        <div>
          <p class="pixel-studio__section-label">${title}</p>
          ${hint ? `<p class="pixel-studio__tools-hint">${hint}</p>` : ""}
        </div>
        <span class="pixel-studio__disclosure-icon" aria-hidden="true"></span>
      </summary>
      <div class="pixel-studio__disclosure-content">
        ${content}
      </div>
    </details>
  `;
}

export function createPixelStudioMarkup(copy = DEFAULT_COPY) {
  const {
    eyebrow,
    title,
    subtitle,
    explainerLabel,
    toolsLabel,
    toolsHint,
    actionsLabel,
    actionsGroupLabel,
    recordingLabel,
    playbackLabel,
    playbackGroupLabel,
    sessionLabel,
    sessionHint,
    sessionIdle,
    sessionCountLabel,
    matchesLabel,
    matchesHint,
    matchesEmpty,
    bestGuessLabel,
    bestGuessHint,
    bestGuessFilterLabel,
    bestGuessFilterHint,
    bestGuessEmpty,
    databaseLabel,
    databaseHint,
    databaseButtonLabel,
    databaseEmpty,
    clearButtonLabel,
  } = { ...DEFAULT_COPY, ...copy };

  return `
    <section class="pixel-studio" aria-label="Pixel drawing studio">
      <p class="hero-label">${eyebrow}</p>
      <h1 class="hero-title">${title}</h1>
      ${createDisclosureCard({
        label: "explainer",
        title: explainerLabel,
        content: `<p class="hero-subtitle pixel-studio__explainer-copy">${subtitle}</p>`,
        className: "pixel-studio__disclosure--explainer",
      })}

      <div class="pixel-studio__panel">
        <div class="pixel-studio__workspace">
          <div class="pixel-studio__controls" role="group" aria-label="Canvas controls">
            ${createDisclosureCard({
              label: "tools",
              title: toolsLabel,
              hint: toolsHint,
              className: "pixel-studio__control-card pixel-studio__control-card--inputs",
              content: `
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
              `,
            })}

            ${createDisclosureCard({
              label: "actions",
              title: actionsLabel,
              className: "pixel-studio__control-card pixel-studio__control-card--actions",
              content: renderPixelStudioToolButtons({
                sectionLabel: actionsLabel,
                groupLabel: actionsGroupLabel,
                buttons: [
                  { id: "pixel-grid-toggle", label: "Hide grid", variant: "secondary", pressed: true },
                  { id: "pixel-download", label: "Download PNG", variant: "secondary" },
                ],
              }),
            })}
          </div>

          ${createDisclosureCard({
            label: "recording",
            title: recordingLabel,
            className: "pixel-studio__recording",
            content: `
              <div class="pixel-studio__recording-header">
                <div>
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
            `,
          })}

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
              <output id="pixel-session-status" class="pixel-studio__recording-status" aria-live="polite">${sessionIdle}</output>
            </div>
            <div class="pixel-studio__session-toolbar">
              <div class="pixel-studio__session-count">
                <span>${sessionCountLabel}</span>
                <output id="pixel-stroke-count" aria-live="polite">0</output>
              </div>
              <div class="pixel-studio__session-actions">
                <button id="pixel-clear" class="pixel-studio__button pixel-studio__button--ghost" type="button">${clearButtonLabel}</button>
              </div>
            </div>
          </section>

          <div class="pixel-studio__canvas-wrap">
            <canvas id="pixel-canvas" class="pixel-studio__canvas" width="${DISPLAY_SIZE}" height="${DISPLAY_SIZE}" aria-label="Pixel drawing canvas"></canvas>
          </div>
        </div>

        <section class="pixel-studio__session pixel-studio__session--results" aria-label="${sessionLabel} results">
          <div class="pixel-studio__matches pixel-studio__matches--best-guess">
            <div class="pixel-studio__tools-header">
              <p class="pixel-studio__section-label">${bestGuessLabel}</p>
              <p class="pixel-studio__tools-hint">${bestGuessHint}</p>
            </div>
            <div class="pixel-studio__filter-grid" aria-label="${bestGuessFilterLabel}" role="group">
              <label class="pixel-studio__toggle pixel-studio__toggle--compact" for="pixel-filter-lines">
                <span>Lines</span>
                <input id="pixel-filter-lines" type="checkbox" aria-label="Filter by live line count" />
              </label>
              <label class="pixel-studio__toggle pixel-studio__toggle--compact" for="pixel-filter-kanji">
                <span>Kanji</span>
                <input id="pixel-filter-kanji" type="checkbox" aria-label="Show kanji" checked />
              </label>
              <label class="pixel-studio__toggle pixel-studio__toggle--compact" for="pixel-filter-hiragana">
                <span>Hiragana</span>
                <input id="pixel-filter-hiragana" type="checkbox" aria-label="Show hiragana" checked />
              </label>
              <label class="pixel-studio__toggle pixel-studio__toggle--compact" for="pixel-filter-katakana">
                <span>Katakana</span>
                <input id="pixel-filter-katakana" type="checkbox" aria-label="Show katakana" checked />
              </label>
            </div>
            <div id="pixel-best-guess" class="pixel-studio__guess-card" aria-live="polite">
              <p class="pixel-studio__match-empty">${bestGuessEmpty}</p>
            </div>
          </div>

          <div class="pixel-studio__matches">
            <div class="pixel-studio__tools-header">
              <p class="pixel-studio__section-label">${matchesLabel}</p>
              <p class="pixel-studio__tools-hint">${matchesHint}</p>
            </div>
            <div class="pixel-studio__lookup-panel">
              <label class="pixel-studio__field pixel-studio__field--wide" for="pixel-match-text-input">
                <span>Matched character text</span>
                <input id="pixel-match-text-input" type="text" maxlength="24" placeholder="Tap a matched character to add it here" />
              </label>
              <div class="pixel-studio__lookup-meta" aria-live="polite">
                <div class="pixel-studio__lookup-block">
                  <p class="pixel-studio__lookup-label">Pronunciation</p>
                  <p id="pixel-match-pronunciation" class="pixel-studio__lookup-value">Tap a matched character to build a reading.</p>
                </div>
                <div class="pixel-studio__lookup-block">
                  <p class="pixel-studio__lookup-label">Rough translation</p>
                  <p id="pixel-match-translation" class="pixel-studio__lookup-value">Meanings for the selected characters show here.</p>
                </div>
              </div>
            </div>
            <div id="pixel-character-matches" class="pixel-studio__match-grid" role="list">
              <p class="pixel-studio__match-empty">${matchesEmpty}</p>
            </div>
          </div>

          <div class="pixel-studio__matches pixel-studio__matches--database">
            <div class="pixel-studio__tools-header">
              <p class="pixel-studio__section-label">${databaseLabel}</p>
              <p class="pixel-studio__tools-hint">${databaseHint}</p>
            </div>
            <div class="pixel-studio__database-toolbar">
              <button id="pixel-load-database" class="pixel-studio__button pixel-studio__button--secondary" type="button">${databaseButtonLabel}</button>
            </div>
            <div id="pixel-database-grid" class="pixel-studio__database-grid" aria-live="polite">
              <p class="pixel-studio__match-empty">${databaseEmpty}</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  `;
}
