function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderShowsList(shows, selectedShowId) {
  if (!shows.length) {
    return '<li class="shows-empty">No shows yet. Create one to get started.</li>';
  }

  return shows
    .map((show) => {
      const selected = show.id === selectedShowId;
      const title = escapeHtml(show.title ?? "Untitled show");
      const description = escapeHtml(show.description ?? "");

      return `
        <li class="show-row ${selected ? "is-selected" : ""}" data-show-id="${escapeHtml(show.id)}">
          <button class="show-select" type="button" data-action="select" data-id="${escapeHtml(show.id)}" aria-pressed="${selected}">
            <strong>${title}</strong>
            ${description ? `<span>${description}</span>` : ""}
          </button>
          <button class="show-delete" type="button" data-action="delete" data-id="${escapeHtml(show.id)}">Delete</button>
        </li>
      `;
    })
    .join("");
}

function renderEditor(selectedShow) {
  if (!selectedShow) {
    return '<p class="editor-placeholder">Select a show to edit it.</p>';
  }

  return `
    <form class="show-form" data-form="edit" novalidate>
      <input type="hidden" name="id" value="${escapeHtml(selectedShow.id)}" />
      <label>
        Title *
        <input name="title" type="text" value="${escapeHtml(selectedShow.title ?? "")}" required />
      </label>
      <label>
        Description
        <textarea name="description" rows="3">${escapeHtml(selectedShow.description ?? "")}</textarea>
      </label>
      <button type="submit">Update show</button>
    </form>
  `;
}

export function renderShowsView({ shows, selectedShowId, errorMessage = "" }) {
  const selectedShow = shows.find((show) => show.id === selectedShowId) ?? null;

  return `
    <section class="shows" aria-live="polite">
      <header>
        <h2>Shows</h2>
      </header>

      ${errorMessage ? `<p class="shows-error" role="alert">${escapeHtml(errorMessage)}</p>` : ""}

      <div class="shows-grid">
        <section>
          <h3>All shows</h3>
          <ul class="shows-list">
            ${renderShowsList(shows, selectedShowId)}
          </ul>
        </section>

        <section>
          <h3>Create show</h3>
          <form class="show-form" data-form="create" novalidate>
            <label>
              Title *
              <input name="title" type="text" required />
            </label>
            <label>
              Description
              <textarea name="description" rows="3"></textarea>
            </label>
            <button type="submit">Create show</button>
          </form>

          <h3>Edit selected show</h3>
          ${renderEditor(selectedShow)}
        </section>
      </div>
    </section>
  `;
}
