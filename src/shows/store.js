const STORAGE_KEY = "phonefoof.shows";

const DEFAULT_SHOWS = [
  {
    id: crypto.randomUUID(),
    title: "The Expanse",
    genre: "Science Fiction",
    seasons: 6,
    status: "Completed",
    link: "https://upload.wikimedia.org/wikipedia/en/4/44/Expanse_%28TV_series%29_titlecard.jpg",
  },
];

function parseShows(rawShows) {
  if (!rawShows) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawShows);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sanitizeShow(show) {
  return {
    id: String(show.id),
    title: String(show.title ?? "").trim(),
    genre: String(show.genre ?? "").trim(),
    seasons: Number.parseInt(show.seasons, 10) || 1,
    status: String(show.status ?? "Planned").trim() || "Planned",
    link: String(show.link ?? "").trim(),
  };
}

export function createShowsStore(storage = window.localStorage) {
  function write(shows) {
    storage.setItem(STORAGE_KEY, JSON.stringify(shows));
  }

  function read() {
    return parseShows(storage.getItem(STORAGE_KEY));
  }

  function listShows() {
    return read();
  }

  function seedIfEmpty() {
    const shows = read();
    if (shows.length === 0) {
      write(DEFAULT_SHOWS);
      return DEFAULT_SHOWS;
    }
    return shows;
  }

  function getShowById(showId) {
    return read().find((show) => show.id === showId) ?? null;
  }

  function createShow(showInput) {
    const show = sanitizeShow({ ...showInput, id: crypto.randomUUID() });
    const shows = read();
    const nextShows = [...shows, show];
    write(nextShows);
    return show;
  }

  function updateShow(showId, updates) {
    const shows = read();
    let updatedShow = null;

    const nextShows = shows.map((show) => {
      if (show.id !== showId) {
        return show;
      }

      updatedShow = sanitizeShow({ ...show, ...updates, id: show.id });
      return updatedShow;
    });

    write(nextShows);
    return updatedShow;
  }

  function deleteShow(showId) {
    const shows = read();
    const nextShows = shows.filter((show) => show.id !== showId);
    const removed = nextShows.length !== shows.length;

    if (removed) {
      write(nextShows);
    }

    return removed;
  }

  return {
    listShows,
    seedIfEmpty,
    getShowById,
    createShow,
    updateShow,
    deleteShow,
  };
}
