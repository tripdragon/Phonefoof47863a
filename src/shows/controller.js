import { createShowsStore } from "./store";
import { renderShowsView } from "./view";

function toShowInput(form) {
  const formData = new FormData(form);
  return {
    title: formData.get("title"),
    genre: formData.get("genre"),
    seasons: formData.get("seasons"),
    status: formData.get("status"),
  };
}

export function renderShowsSection(container) {
  const store = createShowsStore();
  const state = {
    shows: store.seedIfEmpty(),
    selectedShowId: null,
  };

  function refresh() {
    state.shows = store.listShows();
    if (state.selectedShowId && !store.getShowById(state.selectedShowId)) {
      state.selectedShowId = null;
    }
  }

  function selectedShow() {
    if (!state.selectedShowId) {
      return null;
    }

    return store.getShowById(state.selectedShowId);
  }

  function render() {
    const refs = renderShowsView(container, {
      shows: state.shows,
      selectedShow: selectedShow(),
    });

    refs.showsRoot?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) {
        return;
      }

      const action = button.dataset.action;
      const showId = button.dataset.id;

      if (action === "select" && showId) {
        state.selectedShowId = showId;
        render();
      }

      if (action === "delete" && showId) {
        store.deleteShow(showId);
        if (state.selectedShowId === showId) {
          state.selectedShowId = null;
        }
        refresh();
        render();
      }

      if (action === "clear-selection") {
        state.selectedShowId = null;
        render();
      }
    });

    refs.form?.addEventListener("submit", (event) => {
      event.preventDefault();

      const showInput = toShowInput(event.currentTarget);

      if (state.selectedShowId) {
        store.updateShow(state.selectedShowId, showInput);
      } else {
        const createdShow = store.createShow(showInput);
        state.selectedShowId = createdShow.id;
      }

      refresh();
      render();
    });
  }

  refresh();
  render();
}
