import { createShowsStore } from "./store";
import { renderShowsView } from "./view";

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    image.src = objectUrl;
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}

async function createThumbnailDataUrl(file) {
  const image = await fileToImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = 50;
  canvas.height = 50;
  const context = canvas.getContext("2d");

  if (!context) {
    return "";
  }

  const scale = Math.min(50 / image.width, 50 / image.height);
  const drawWidth = Math.max(1, Math.round(image.width * scale));
  const drawHeight = Math.max(1, Math.round(image.height * scale));
  const dx = Math.floor((50 - drawWidth) / 2);
  const dy = Math.floor((50 - drawHeight) / 2);

  context.clearRect(0, 0, 50, 50);
  context.drawImage(image, dx, dy, drawWidth, drawHeight);

  const blob = await new Promise((resolve) => {
    canvas.toBlob((nextBlob) => resolve(nextBlob), "image/png");
  });

  if (!blob) {
    return "";
  }

  return blobToDataUrl(blob);
}

function toShowInput(form) {
  const formData = new FormData(form);
  return {
    title: formData.get("title"),
    genre: formData.get("genre"),
    seasons: formData.get("seasons"),
    link: formData.get("link"),
    status: formData.get("status"),
    thumbnail: formData.get("thumbnailData"),
  };
}

function renderThumbnailPreview(form, thumbnailData) {
  const preview = form.querySelector("[data-thumbnail-preview]");
  const hiddenInput = form.querySelector('input[name="thumbnailData"]');
  const clearButton = form.querySelector('[data-action="clear-thumbnail"]');

  if (!preview || !hiddenInput || !clearButton) {
    return;
  }

  hiddenInput.value = thumbnailData;
  clearButton.disabled = !thumbnailData;
  preview.innerHTML = thumbnailData ? '<img src="" alt="Selected thumbnail" />' : "<span>Tap to choose image</span>";

  if (thumbnailData) {
    const image = preview.querySelector("img");
    if (image) {
      image.src = thumbnailData;
    }
  }
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

    refs.showsRoot?.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) {
        return;
      }

      const action = button.dataset.action;
      const showId = button.dataset.id;
      const form = refs.form;

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

      if (action === "copy-link") {
        const link = button.dataset.link;
        if (link) {
          navigator.clipboard?.writeText(link);
        }
      }

      if (action === "clear-selection") {
        state.selectedShowId = null;
        render();
      }

      if (action === "pick-thumbnail" && form) {
        const fileInput = form.querySelector('input[name="thumbnailFile"]');
        fileInput?.click();
      }

      if (action === "clear-thumbnail" && form) {
        renderThumbnailPreview(form, "");
        const fileInput = form.querySelector('input[name="thumbnailFile"]');
        if (fileInput) {
          fileInput.value = "";
        }
      }
    });

    const fileInput = refs.form?.querySelector('input[name="thumbnailFile"]');
    fileInput?.addEventListener("change", async (event) => {
      const input = event.currentTarget;
      const [file] = input.files ?? [];
      if (!file || !refs.form) {
        return;
      }

      const thumbnailData = await createThumbnailDataUrl(file);
      renderThumbnailPreview(refs.form, thumbnailData);
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
