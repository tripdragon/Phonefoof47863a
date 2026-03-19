function renderButton({ id, label, variant = "secondary", pressed }) {
  const pressedAttribute = typeof pressed === "boolean"
    ? ` aria-pressed="${pressed}"`
    : "";

  return `<button id="${id}" class="pixel-studio__button pixel-studio__button--${variant}" type="button"${pressedAttribute}>${label}</button>`;
}

export function renderPixelStudioToolButtons({ sectionLabel, groupLabel, buttons, rowClassName = "" }) {
  const rowClasses = ["pixel-studio__button-row", rowClassName].filter(Boolean).join(" ");

  return `
    <div class="pixel-studio__control-card pixel-studio__control-card--actions">
      <p class="pixel-studio__section-label">${sectionLabel}</p>
      <div class="${rowClasses}" role="group" aria-label="${groupLabel}">
        ${buttons.map(renderButton).join("")}
      </div>
    </div>
  `;
}
