import { renderShowsView } from "./view.js";

function normalizePayload(formData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
  };
}

export function createShowsController({ root, store }) {
  const state = {
    shows: [],
    selectedShowId: null,
    errorMessage: "",
  };

  function render() {
    root.innerHTML = renderShowsView(state);
  }

  async function refreshShows() {
    const shows = await store.getShows();
    state.shows = Array.isArray(shows) ? shows : [];

    if (!state.shows.some((show) => show.id === state.selectedShowId)) {
      state.selectedShowId = state.shows[0]?.id ?? null;
    }
  }

  async function mutate(task) {
    try {
      state.errorMessage = "";
      await task();
      await refreshShows();
    } catch (error) {
      state.errorMessage = error instanceof Error ? error.message : "Something went wrong.";
    }

    render();
  }

  root.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    event.preventDefault();
    const formData = new FormData(form);
    const payload = normalizePayload(formData);

    if (!payload.title) {
      state.errorMessage = "Title is required.";
      render();
      return;
    }

    if (form.dataset.form === "create") {
      await mutate(async () => {
        await store.createShow(payload);
      });
      return;
    }

    if (form.dataset.form === "edit") {
      const id = String(formData.get("id") ?? "");
      if (!id) {
        state.errorMessage = "Select a show before updating.";
        render();
        return;
      }

      await mutate(async () => {
        await store.updateShow(id, payload);
      });
    }
  });

  root.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionElement = target.closest("[data-action]");
    if (!(actionElement instanceof HTMLElement)) {
      return;
    }

    const action = actionElement.dataset.action;
    const id = actionElement.dataset.id;

    if (action === "select" && id) {
      state.selectedShowId = id;
      state.errorMessage = "";
      render();
      return;
    }

    if (action === "delete" && id) {
      await mutate(async () => {
        await store.deleteShow(id);
      });
    }
  });

  return {
    async init() {
      await mutate(async () => {
        await refreshShows();
      });
    },
  };
}
