function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderShowList(shows, selectedShowId) {
  if (shows.length === 0) {
    return "<p class=\"shows-empty\">No shows yet. Add your first title.</p>";
  }

  return `
    <ul class="shows-list" aria-label="Shows list">
      ${shows
        .map((show) => {
          const selected = show.id === selectedShowId;
          return `
            <li>
              <button class="shows-item" type="button" data-action="select" data-id="${show.id}" aria-current="${selected}">
                <span class="shows-item-title">${escapeHtml(show.title)}</span>
                <span class="shows-item-meta">${escapeHtml(show.genre)} · ${show.seasons} season(s) · ${escapeHtml(show.status)}</span>
              </button>
            </li>
          `;
        })
        .join("")}
    </ul>
  `;
}

function renderShowDetail(show) {
  if (!show) {
    return `
      <div class="shows-detail-empty">
        <h3>Select a show</h3>
        <p>Pick a title from the list or create a new show to get started.</p>
      </div>
    `;
  }

  return `
    <article class="shows-detail-card" aria-live="polite">
      <h3>${escapeHtml(show.title)}</h3>
      <dl>
        <div><dt>Genre</dt><dd>${escapeHtml(show.genre)}</dd></div>
        <div><dt>Seasons</dt><dd>${show.seasons}</dd></div>
        <div><dt>Status</dt><dd>${escapeHtml(show.status)}</dd></div>
      </dl>
      <button class="danger" type="button" data-action="delete" data-id="${show.id}">Delete show</button>
    </article>
  `;
}

function renderShowForm(show) {
  const formTitle = show ? "Edit show" : "Add show";

  return `
    <form class="shows-form" id="shows-form">
      <h3>${formTitle}</h3>
      <label>
        Title
        <input required name="title" value="${escapeHtml(show?.title ?? "")}" />
      </label>
      <label>
        Genre
        <input required name="genre" value="${escapeHtml(show?.genre ?? "")}" />
      </label>
      <label>
        Seasons
        <input required min="1" type="number" name="seasons" value="${show?.seasons ?? 1}" />
      </label>
      <label>
        Status
        <select name="status">
          ${["Planned", "Watching", "Completed", "On Hold"]
            .map((status) => `<option ${show?.status === status ? "selected" : ""}>${status}</option>`)
            .join("")}
        </select>
      </label>
      <div class="shows-form-actions">
        <button class="action" type="submit">${show ? "Save changes" : "Create show"}</button>
        ${show ? '<button type="button" class="ghost" data-action="clear-selection">Create new</button>' : ""}
      </div>
    </form>
  `;
}

export function renderShowsView(container, state) {
  const { shows, selectedShow } = state;

  container.innerHTML = `
    <section class="shows" aria-label="Shows manager">
      <header class="shows-header">
        <p class="hero-label">Shows</p>
        <h2 class="hero-title">Track your TV library</h2>
      </header>
      <div class="shows-grid">
        <section class="shows-list-panel">${renderShowList(shows, selectedShow?.id)}</section>
        <section class="shows-detail-panel">${renderShowDetail(selectedShow)}</section>
        <section class="shows-form-panel">${renderShowForm(selectedShow)}</section>
      </div>
    </section>
  `;

  return {
    showsRoot: container.querySelector(".shows"),
    form: container.querySelector("#shows-form"),
  };
}
