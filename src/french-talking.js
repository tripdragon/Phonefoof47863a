import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { frenchDialogues, frenchPhrases } from './french-talking-data';

let frenchDbPromise;

function normalizeForLookup(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/qu/g, 'k')
    .replace(/ph/g, 'f')
    .replace(/eau/g, 'o')
    .replace(/au/g, 'o')
    .replace(/ou/g, 'u')
    .replace(/oi/g, 'wa')
    .replace(/ch/g, 'sh')
    .replace(/gn/g, 'ny')
    .replace(/ill/g, 'y')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function buildLookupTokens(phrase) {
  return {
    english: normalizeForLookup(phrase.english),
    french: normalizeForLookup(phrase.french),
    phonetic: normalizeForLookup(phrase.phonetic),
    combined: normalizeForLookup(`${phrase.english} ${phrase.french} ${phrase.phonetic} ${phrase.category}`),
  };
}

function scorePhrase(phrase, query, mode) {
  if (!query) {
    return 1;
  }

  const tokens = buildLookupTokens(phrase);
  const lookup = mode === 'english' ? tokens.english : mode === 'sounds' ? `${tokens.french} ${tokens.phonetic}` : tokens.combined;

  if (lookup.startsWith(query)) {
    return 120 - lookup.indexOf(query);
  }

  if (lookup.includes(query)) {
    return 80 - lookup.indexOf(query);
  }

  const queryParts = query.split(' ').filter(Boolean);
  if (queryParts.length > 1 && queryParts.every((part) => lookup.includes(part))) {
    return 60;
  }

  const compactLookup = lookup.replaceAll(' ', '');
  const compactQuery = query.replaceAll(' ', '');
  if (compactLookup.includes(compactQuery)) {
    return 40;
  }

  return 0;
}

function renderPhraseResults(container, phrases, query, mode) {
  const normalizedQuery = normalizeForLookup(query);
  const results = phrases
    .map((phrase) => ({ phrase, score: scorePhrase(phrase, normalizedQuery, mode) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.phrase.english.localeCompare(b.phrase.english));

  const visibleResults = normalizedQuery ? results.slice(0, 12) : phrases.map((phrase) => ({ phrase, score: 1 }));

  container.innerHTML = `
    <div class="french-results__meta">
      <p>${normalizedQuery ? `${results.length} matching phrase${results.length === 1 ? '' : 's'}` : `Showing all ${phrases.length} phrases from the SQLite file`}</p>
      <p>Lookup mode: <strong>${mode === 'english' ? 'English meaning' : mode === 'sounds' ? 'French sounds' : 'All fields'}</strong></p>
    </div>
    <div class="french-results__list" role="list" aria-label="French search results">
      ${visibleResults.length
        ? visibleResults
            .map(
              ({ phrase }) => `
                <article class="french-result-card" role="listitem">
                  <p class="french-result-card__english">${phrase.english}</p>
                  <p class="french-result-card__french">${phrase.french}</p>
                  <p class="french-result-card__phonetic">Pronounced: ${phrase.phonetic}</p>
                  <p class="french-result-card__category">${phrase.category}</p>
                </article>
              `,
            )
            .join('')
        : '<p class="french-results__empty">No close matches yet. Try an English meaning, a French spelling, or a sound-like guess.</p>'}
    </div>
  `;
}

function renderPhraseTableRows(phrases) {
  return phrases
    .map(
      (phrase, index) => `
        <tr>
          <td data-label="#">${index + 1}</td>
          <td data-label="English">${phrase.english}</td>
          <td data-label="French">${phrase.french}</td>
          <td data-label="Phonetic">${phrase.phonetic}</td>
          <td data-label="Category">${phrase.category}</td>
        </tr>
      `,
    )
    .join('');
}

function renderDialogueCards(dialogues) {
  return dialogues
    .map(
      (dialogue) => `
        <article class="french-dialogue-card">
          <div class="french-dialogue-card__header">
            <h3>${dialogue.title}</h3>
            <p>${dialogue.situation}</p>
          </div>
          <ol class="french-dialogue-card__lines">
            ${dialogue.lines
              .map(
                (line) => `
                  <li>
                    <p class="french-dialogue-card__speaker">${line.speaker}</p>
                    <p class="french-dialogue-card__french">${line.french}</p>
                    <p class="french-dialogue-card__english">${line.english}</p>
                  </li>
                `,
              )
              .join('')}
          </ol>
        </article>
      `,
    )
    .join('');
}

async function loadFrenchDatabase() {
  if (!frenchDbPromise) {
    frenchDbPromise = Promise.all([
      initSqlJs({
        locateFile: () => sqlWasmUrl,
      }),
      fetch(`${import.meta.env.BASE_URL}sqlite/french-phrases.sqlite`).then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load SQLite file (${response.status})`);
        }

        return response.arrayBuffer();
      }),
    ]).then(([SQL, buffer]) => new SQL.Database(new Uint8Array(buffer)));
  }

  return frenchDbPromise;
}

function rowsToObjects(result) {
  if (!result.length) {
    return [];
  }

  const [{ columns, values }] = result;
  return values.map((row) => Object.fromEntries(row.map((value, index) => [columns[index], value])));
}

async function loadFrenchContent() {
  const db = await loadFrenchDatabase();
  const phrases = rowsToObjects(db.exec('SELECT english, french, phonetic, category FROM phrases ORDER BY id'));
  const lines = rowsToObjects(
    db.exec(`
      SELECT dialogue_id, line_index, title, situation, speaker, french, english
      FROM dialogue_lines
      ORDER BY dialogue_id, line_index
    `),
  );

  const dialogues = lines.reduce((collection, line) => {
    const currentDialogue = collection[collection.length - 1];

    if (!currentDialogue || currentDialogue.dialogueId !== line.dialogue_id) {
      collection.push({
        dialogueId: line.dialogue_id,
        title: line.title,
        situation: line.situation,
        lines: [],
      });
    }

    collection[collection.length - 1].lines.push({
      speaker: line.speaker,
      french: line.french,
      english: line.english,
    });

    return collection;
  }, []);

  return { phrases, dialogues };
}

export function renderFrenchTalkingRoute(container) {
  const fallbackPhraseTable = renderPhraseTableRows(frenchPhrases);
  const fallbackDialogues = renderDialogueCards(frenchDialogues);

  container.innerHTML = `
    <div class="french-page">
      <p class="hero-label">French talking</p>
      <h1 class="hero-title">French phrases loaded from a GitHub Pages-friendly SQLite file</h1>
      <p class="hero-subtitle">
        This page fetches a static <code>.sqlite</code> database, opens it in the browser, and uses it for phrase browsing, conversational study, and short back-and-forth dialogue examples.
      </p>

      <section class="french-note" aria-label="SQLite hosting note">
        <p><strong>GitHub Pages note:</strong> the SQLite database is shipped as a static asset and read client-side, so no server database process is required.</p>
      </section>

      <section class="french-search" aria-label="French phrase search">
        <div class="french-search__controls">
          <label class="french-search__label" for="french-search-input">Search by meaning or sound</label>
          <input id="french-search-input" class="french-search__input" type="search" placeholder="Try: bathroom, bonjoor, coffee, comment tu t'appelles..." autocomplete="off" />
        </div>
        <fieldset class="french-search__filters">
          <legend>Filter lookup</legend>
          <label><input type="radio" name="lookup-mode" value="all" checked /> All fields</label>
          <label><input type="radio" name="lookup-mode" value="english" /> English translation</label>
          <label><input type="radio" name="lookup-mode" value="sounds" /> French sounds</label>
        </fieldset>
        <div id="french-results" class="french-results" aria-live="polite"></div>
      </section>

      <section class="french-conversation" aria-label="Conversational phrase highlights">
        <div class="french-database__heading">
          <h2>Conversational phrases</h2>
          <p>Extra casual lines for greetings, making plans, and quick reactions.</p>
        </div>
        <div id="french-conversation-chips" class="french-chip-grid"></div>
      </section>

      <section class="french-database" aria-label="French tourist phrase database">
        <div class="french-database__heading">
          <h2>Phrase database</h2>
          <p>Loaded from SQLite with English meaning, natural French wording, and a simple phonetic guide.</p>
        </div>
        <div class="french-database__table-wrap">
          <table class="french-database__table">
            <thead>
              <tr>
                <th>#</th>
                <th>English</th>
                <th>French</th>
                <th>Phonetic</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody id="french-phrase-table-body">${fallbackPhraseTable}</tbody>
          </table>
        </div>
      </section>

      <section class="french-dialogues" aria-label="Short French conversations">
        <div class="french-database__heading">
          <h2>Short volley conversations</h2>
          <p>Fast two-person exchanges you can rehearse aloud.</p>
        </div>
        <div id="french-dialogue-list" class="french-dialogue-grid">${fallbackDialogues}</div>
      </section>

      <div class="hero-controls french-page__actions">
        <a class="action french-page__back-link" href="#/">Back home</a>
      </div>
    </div>
  `;

  const input = container.querySelector('#french-search-input');
  const results = container.querySelector('#french-results');
  const filters = Array.from(container.querySelectorAll('input[name="lookup-mode"]'));
  const phraseTableBody = container.querySelector('#french-phrase-table-body');
  const conversationChips = container.querySelector('#french-conversation-chips');
  const dialogueList = container.querySelector('#french-dialogue-list');

  let activePhrases = [...frenchPhrases];

  const refresh = () => {
    const mode = filters.find((filter) => filter.checked)?.value ?? 'all';
    renderPhraseResults(results, activePhrases, input.value, mode);
  };

  const renderConversationalHighlights = (phrases) => {
    const conversationalPhrases = phrases.filter((phrase) => phrase.category === 'Conversational');
    conversationChips.innerHTML = conversationalPhrases
      .map(
        (phrase) => `
          <article class="french-chip-card">
            <p class="french-chip-card__french">${phrase.french}</p>
            <p class="french-chip-card__english">${phrase.english}</p>
            <p class="french-chip-card__phonetic">${phrase.phonetic}</p>
          </article>
        `,
      )
      .join('');
  };

  input.addEventListener('input', refresh);
  filters.forEach((filter) => filter.addEventListener('change', refresh));
  renderConversationalHighlights(activePhrases);
  refresh();

  loadFrenchContent()
    .then(({ phrases, dialogues }) => {
      activePhrases = phrases;
      phraseTableBody.innerHTML = renderPhraseTableRows(phrases);
      dialogueList.innerHTML = renderDialogueCards(dialogues);
      renderConversationalHighlights(phrases);
      refresh();
    })
    .catch((error) => {
      console.error(error);
      results.insertAdjacentHTML(
        'afterbegin',
        '<p class="french-results__warning">SQLite load failed, so the built-in fallback phrases are being shown instead.</p>',
      );
    });
}
