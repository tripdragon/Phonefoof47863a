const spanishTouristPhrases = [
  { english: "Hello", spanish: "Hola", phonetic: "oh-lah", category: "Basics" },
  { english: "Good morning", spanish: "Buenos días", phonetic: "bway-nohs dee-ahs", category: "Basics" },
  { english: "Good afternoon", spanish: "Buenas tardes", phonetic: "bway-nahs tar-dehs", category: "Basics" },
  { english: "Good night", spanish: "Buenas noches", phonetic: "bway-nahs noh-chehs", category: "Basics" },
  { english: "Goodbye", spanish: "Adiós", phonetic: "ah-dee-ohs", category: "Basics" },
  { english: "Please", spanish: "Por favor", phonetic: "por fah-vor", category: "Basics" },
  { english: "Thank you", spanish: "Gracias", phonetic: "grah-see-ahs", category: "Basics" },
  { english: "You're welcome", spanish: "De nada", phonetic: "deh nah-dah", category: "Basics" },
  { english: "Excuse me", spanish: "Perdón", phonetic: "pehr-dohn", category: "Basics" },
  { english: "Sorry", spanish: "Lo siento", phonetic: "loh see-ehn-toh", category: "Basics" },
  { english: "Do you speak English?", spanish: "¿Habla inglés?", phonetic: "ah-blah een-glehs", category: "Help" },
  { english: "I don't understand", spanish: "No entiendo", phonetic: "noh ehn-tee-ehn-doh", category: "Help" },
  { english: "Can you repeat that?", spanish: "¿Puede repetir eso?", phonetic: "pway-deh reh-peh-teer eh-soh", category: "Help" },
  { english: "Can you help me?", spanish: "¿Puede ayudarme?", phonetic: "pway-deh ah-yoo-dar-meh", category: "Help" },
  { english: "Where is the train station?", spanish: "¿Dónde está la estación de tren?", phonetic: "dohn-deh ehs-tah lah ehs-tah-see-ohn deh trehn", category: "Directions" },
  { english: "Where is the bus stop?", spanish: "¿Dónde está la parada de autobús?", phonetic: "dohn-deh ehs-tah lah pah-rah-dah deh ow-toh-boos", category: "Directions" },
  { english: "Where is the bathroom?", spanish: "¿Dónde está el baño?", phonetic: "dohn-deh ehs-tah ehl bahn-yoh", category: "Directions" },
  { english: "How do I get to the city center?", spanish: "¿Cómo llego al centro?", phonetic: "koh-moh yeh-goh ahl sehn-troh", category: "Directions" },
  { english: "Turn left", spanish: "Gire a la izquierda", phonetic: "hee-reh ah lah ees-keyehr-dah", category: "Directions" },
  { english: "Turn right", spanish: "Gire a la derecha", phonetic: "hee-reh ah lah deh-reh-chah", category: "Directions" },
  { english: "Go straight ahead", spanish: "Siga todo recto", phonetic: "see-gah toh-doh rrehk-toh", category: "Directions" },
  { english: "Is it far?", spanish: "¿Está lejos?", phonetic: "ehs-tah leh-hohs", category: "Directions" },
  { english: "How much is it?", spanish: "¿Cuánto cuesta?", phonetic: "kwahn-toh kwehs-tah", category: "Shopping" },
  { english: "Do you take cards?", spanish: "¿Aceptan tarjeta?", phonetic: "ah-sehp-tahn tar-heh-tah", category: "Shopping" },
  { english: "I would like this", spanish: "Quiero esto", phonetic: "kee-eh-roh ehs-toh", category: "Shopping" },
  { english: "Do you have something cheaper?", spanish: "¿Tiene algo más barato?", phonetic: "tee-eh-neh ahl-goh mahs bah-rah-toh", category: "Shopping" },
  { english: "I'm just looking", spanish: "Solo estoy mirando", phonetic: "soh-loh ehs-toy mee-rahn-doh", category: "Shopping" },
  { english: "A table for two, please", spanish: "Una mesa para dos, por favor", phonetic: "oo-nah meh-sah pah-rah dohs por fah-vor", category: "Food" },
  { english: "The menu, please", spanish: "El menú, por favor", phonetic: "ehl meh-noo por fah-vor", category: "Food" },
  { english: "Water, please", spanish: "Agua, por favor", phonetic: "ah-gwah por fah-vor", category: "Food" },
  { english: "The check, please", spanish: "La cuenta, por favor", phonetic: "lah kwehn-tah por fah-vor", category: "Food" },
  { english: "It was delicious", spanish: "Estaba delicioso", phonetic: "ehs-tah-bah deh-lee-see-oh-soh", category: "Food" },
  { english: "I have a reservation", spanish: "Tengo una reserva", phonetic: "tehn-goh oo-nah rreh-sehr-vah", category: "Travel" },
  { english: "I need a hotel", spanish: "Necesito un hotel", phonetic: "neh-seh-see-toh oon oh-tehl", category: "Travel" },
  { english: "One ticket, please", spanish: "Un boleto, por favor", phonetic: "oon boh-leh-toh por fah-vor", category: "Travel" },
  { english: "What time does it leave?", spanish: "¿A qué hora sale?", phonetic: "ah keh oh-rah sah-leh", category: "Travel" },
  { english: "Can I have a map?", spanish: "¿Me da un mapa?", phonetic: "meh dah oon mah-pah", category: "Travel" },
  { english: "I am lost", spanish: "Estoy perdido", phonetic: "ehs-toy pehr-dee-doh", category: "Help" },
  { english: "Call the police", spanish: "Llame a la policía", phonetic: "yah-meh ah lah poh-lee-see-ah", category: "Emergency" },
  { english: "I need a doctor", spanish: "Necesito un médico", phonetic: "neh-seh-see-toh oon meh-dee-koh", category: "Emergency" },
  { english: "Where is the pharmacy?", spanish: "¿Dónde está la farmacia?", phonetic: "dohn-deh ehs-tah lah far-mah-see-ah", category: "Emergency" },
  { english: "Can you call a taxi?", spanish: "¿Puede llamar un taxi?", phonetic: "pway-deh yah-mar oon tak-see", category: "Travel" },
];

function normalizeForLookup(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ll/g, "y")
    .replace(/j/g, "h")
    .replace(/h/g, "")
    .replace(/qu/g, "k")
    .replace(/v/g, "b")
    .replace(/z/g, "s")
    .replace(/ce/g, "se")
    .replace(/ci/g, "si")
    .replace(/ñ/g, "ny")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildLookupTokens(phrase) {
  return {
    english: normalizeForLookup(phrase.english),
    spanish: normalizeForLookup(phrase.spanish),
    phonetic: normalizeForLookup(phrase.phonetic),
    combined: normalizeForLookup(`${phrase.english} ${phrase.spanish} ${phrase.phonetic} ${phrase.category}`),
  };
}

function scorePhrase(phrase, query, mode) {
  if (!query) {
    return 1;
  }

  const tokens = buildLookupTokens(phrase);
  const lookup = mode === "english" ? tokens.english : mode === "sounds" ? `${tokens.spanish} ${tokens.phonetic}` : tokens.combined;

  if (lookup.startsWith(query)) {
    return 120 - lookup.indexOf(query);
  }

  if (lookup.includes(query)) {
    return 80 - lookup.indexOf(query);
  }

  const queryParts = query.split(" ").filter(Boolean);
  if (queryParts.length > 1 && queryParts.every((part) => lookup.includes(part))) {
    return 60;
  }

  const compactLookup = lookup.replaceAll(" ", "");
  const compactQuery = query.replaceAll(" ", "");
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
      <p>${normalizedQuery ? `${results.length} matching phrase${results.length === 1 ? "" : "s"}` : `Showing all ${phrases.length} phrases`}</p>
      <p>Lookup mode: <strong>${mode === "english" ? "English meaning" : mode === "sounds" ? "Spanish sounds" : "All fields"}</strong></p>
    </div>
    <div class="french-results__list" role="list" aria-label="Spanish search results">
      ${visibleResults.length
        ? visibleResults
            .map(
              ({ phrase }) => `
                <article class="french-result-card" role="listitem">
                  <p class="french-result-card__english">${phrase.english}</p>
                  <p class="french-result-card__french">${phrase.spanish}</p>
                  <p class="french-result-card__phonetic">Pronounced: ${phrase.phonetic}</p>
                  <p class="french-result-card__category">${phrase.category}</p>
                </article>
              `,
            )
            .join("")
        : '<p class="french-results__empty">No close matches yet. Try an English meaning, a Spanish spelling, or a sound-like guess.</p>'}
    </div>
  `;
}

export function renderSpanishTalkingRoute(container) {
  const phraseTable = spanishTouristPhrases
    .map(
      (phrase, index) => `
        <tr>
          <td data-label="#">${index + 1}</td>
          <td data-label="English">${phrase.english}</td>
          <td data-label="Spanish">${phrase.spanish}</td>
          <td data-label="Phonetic">${phrase.phonetic}</td>
          <td data-label="Category">${phrase.category}</td>
        </tr>
      `,
    )
    .join("");

  container.innerHTML = `
    <div class="french-page">
      <p class="hero-label">Spanish talking</p>
      <h1 class="hero-title">Spanish mini tourist phrases for walking around town</h1>
      <p class="hero-subtitle">
        Search forty-two useful travel phrases with live phonetic-friendly matching, then study the full phrase bank at the bottom.
      </p>

      <section class="french-search" aria-label="Spanish phrase search">
        <div class="french-search__controls">
          <label class="french-search__label" for="spanish-search-input">Search by meaning or sound</label>
          <input id="spanish-search-input" class="french-search__input" type="search" placeholder="Try: bathroom, oh-lah, taxi, kwahn-toh kwehs-tah..." autocomplete="off" />
        </div>
        <fieldset class="french-search__filters">
          <legend>Filter lookup</legend>
          <label><input type="radio" name="lookup-mode" value="all" checked /> All fields</label>
          <label><input type="radio" name="lookup-mode" value="english" /> English translation</label>
          <label><input type="radio" name="lookup-mode" value="sounds" /> Spanish sounds</label>
        </fieldset>
        <div id="spanish-results" class="french-results" aria-live="polite"></div>
      </section>

      <section class="french-database" aria-label="Spanish tourist phrase database">
        <div class="french-database__heading">
          <h2>Phrase database</h2>
          <p>English meaning, natural Spanish wording, and a simple phonetic guide.</p>
        </div>
        <div class="french-database__table-wrap">
          <table class="french-database__table">
            <thead>
              <tr>
                <th>#</th>
                <th>English</th>
                <th>Spanish</th>
                <th>Phonetic</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>${phraseTable}</tbody>
          </table>
        </div>
      </section>
      <div class="hero-controls french-page__actions">
        <a class="action french-page__back-link" href="#/">Back home</a>
      </div>
    </div>
  `;

  const input = container.querySelector("#spanish-search-input");
  const results = container.querySelector("#spanish-results");
  const filters = Array.from(container.querySelectorAll('input[name="lookup-mode"]'));

  const refresh = () => {
    const mode = filters.find((filter) => filter.checked)?.value ?? "all";
    renderPhraseResults(results, spanishTouristPhrases, input.value, mode);
  };

  input.addEventListener("input", refresh);
  filters.forEach((filter) => filter.addEventListener("change", refresh));
  refresh();
}
