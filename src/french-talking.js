const frenchTouristPhrases = [
  { english: "Hello", french: "Bonjour", phonetic: "bohn-zhoor", category: "Basics" },
  { english: "Good evening", french: "Bonsoir", phonetic: "bohn-swahr", category: "Basics" },
  { english: "Goodbye", french: "Au revoir", phonetic: "oh ruh-vwahr", category: "Basics" },
  { english: "Please", french: "S'il vous plaît", phonetic: "seel voo pleh", category: "Basics" },
  { english: "Thank you", french: "Merci", phonetic: "mehr-see", category: "Basics" },
  { english: "You're welcome", french: "De rien", phonetic: "duh ree-ehn", category: "Basics" },
  { english: "Excuse me", french: "Excusez-moi", phonetic: "ex-kew-zay mwah", category: "Basics" },
  { english: "Sorry", french: "Pardon", phonetic: "par-dohn", category: "Basics" },
  { english: "Do you speak English?", french: "Parlez-vous anglais ?", phonetic: "par-lay voo ahn-glay", category: "Help" },
  { english: "I don't understand", french: "Je ne comprends pas", phonetic: "zhuh nuh kom-prahn pah", category: "Help" },
  { english: "Can you repeat that?", french: "Pouvez-vous répéter ?", phonetic: "poo-vay voo ray-pay-tay", category: "Help" },
  { english: "Can you help me?", french: "Pouvez-vous m'aider ?", phonetic: "poo-vay voo may-day", category: "Help" },
  { english: "Where is the train station?", french: "Où est la gare ?", phonetic: "oo eh lah gahr", category: "Directions" },
  { english: "Where is the bus stop?", french: "Où est l'arrêt de bus ?", phonetic: "oo eh lah-ray duh boos", category: "Directions" },
  { english: "Where is the bathroom?", french: "Où sont les toilettes ?", phonetic: "oo sohn lay twa-let", category: "Directions" },
  { english: "How do I get to the city center?", french: "Comment aller au centre-ville ?", phonetic: "koh-mahn ah-lay oh sahn-truh veel", category: "Directions" },
  { english: "Turn left", french: "Tournez à gauche", phonetic: "toor-nay ah gohsh", category: "Directions" },
  { english: "Turn right", french: "Tournez à droite", phonetic: "toor-nay ah dwat", category: "Directions" },
  { english: "Go straight ahead", french: "Allez tout droit", phonetic: "ah-lay too drwah", category: "Directions" },
  { english: "Is it far?", french: "C'est loin ?", phonetic: "say lwahn", category: "Directions" },
  { english: "How much is it?", french: "C'est combien ?", phonetic: "say kom-bee-ehn", category: "Shopping" },
  { english: "Do you take cards?", french: "Vous prenez la carte ?", phonetic: "voo pruh-nay lah kart", category: "Shopping" },
  { english: "I would like this", french: "Je voudrais ça", phonetic: "zhuh voo-dray sah", category: "Shopping" },
  { english: "Do you have something cheaper?", french: "Vous avez quelque chose de moins cher ?", phonetic: "voo zah-vay kel-kuh shohz duh mwahn shehr", category: "Shopping" },
  { english: "I'm just looking", french: "Je regarde seulement", phonetic: "zhuh ruh-gard suhl-mahn", category: "Shopping" },
  { english: "A table for two, please", french: "Une table pour deux, s'il vous plaît", phonetic: "ewn tah-bluh poor duh, seel voo pleh", category: "Food" },
  { english: "The menu, please", french: "La carte, s'il vous plaît", phonetic: "lah kart, seel voo pleh", category: "Food" },
  { english: "Water, please", french: "De l'eau, s'il vous plaît", phonetic: "duh loh, seel voo pleh", category: "Food" },
  { english: "The check, please", french: "L'addition, s'il vous plaît", phonetic: "lah-dee-syohn, seel voo pleh", category: "Food" },
  { english: "It was delicious", french: "C'était délicieux", phonetic: "say-tay day-lee-syuh", category: "Food" },
  { english: "I have a reservation", french: "J'ai une réservation", phonetic: "zhay ewn ray-zer-vah-syohn", category: "Travel" },
  { english: "I need a hotel", french: "J'ai besoin d'un hôtel", phonetic: "zhay buh-zwahn duhn oh-tel", category: "Travel" },
  { english: "One ticket, please", french: "Un billet, s'il vous plaît", phonetic: "uhn bee-yay, seel voo pleh", category: "Travel" },
  { english: "What time does it leave?", french: "À quelle heure ça part ?", phonetic: "ah kel ur sah par", category: "Travel" },
  { english: "Can I have a map?", french: "Je peux avoir un plan ?", phonetic: "zhuh puh ah-vwahr uhn plahn", category: "Travel" },
  { english: "I am lost", french: "Je suis perdu", phonetic: "zhuh swee pair-dew", category: "Help" },
  { english: "Call the police", french: "Appelez la police", phonetic: "ah-play lah poh-lees", category: "Emergency" },
  { english: "I need a doctor", french: "J'ai besoin d'un médecin", phonetic: "zhay buh-zwahn duhn med-sahn", category: "Emergency" },
  { english: "Where is the pharmacy?", french: "Où est la pharmacie ?", phonetic: "oo eh lah far-ma-see", category: "Emergency" },
  { english: "Can you call a taxi?", french: "Pouvez-vous appeler un taxi ?", phonetic: "poo-vay voo zah-play uhn tak-see", category: "Travel" },
];

function normalizeForLookup(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/qu/g, "k")
    .replace(/ph/g, "f")
    .replace(/eau/g, "o")
    .replace(/au/g, "o")
    .replace(/ou/g, "u")
    .replace(/oi/g, "wa")
    .replace(/ch/g, "sh")
    .replace(/gn/g, "ny")
    .replace(/ill/g, "y")
    .replace(/[^a-z0-9]+/g, " ")
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
  const lookup = mode === "english" ? tokens.english : mode === "sounds" ? `${tokens.french} ${tokens.phonetic}` : tokens.combined;

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
      <p>Lookup mode: <strong>${mode === "english" ? "English meaning" : mode === "sounds" ? "French sounds" : "All fields"}</strong></p>
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
            .join("")
        : '<p class="french-results__empty">No close matches yet. Try an English meaning, a French spelling, or a sound-like guess.</p>'}
    </div>
  `;
}

export function renderFrenchTalkingRoute(container) {
  const phraseTable = frenchTouristPhrases
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
    .join("");

  container.innerHTML = `
    <div class="french-page">
      <p class="hero-label">French talking</p>
      <h1 class="hero-title">French mini tourist phrases for walking around town</h1>
      <p class="hero-subtitle">
        Search forty useful travel phrases with live phonetic-friendly matching, then study the full phrase bank at the bottom.
      </p>

      <section class="french-search" aria-label="French phrase search">
        <div class="french-search__controls">
          <label class="french-search__label" for="french-search-input">Search by meaning or sound</label>
          <input id="french-search-input" class="french-search__input" type="search" placeholder="Try: bathroom, bonjoor, taxi, say kombyen..." autocomplete="off" />
        </div>
        <fieldset class="french-search__filters">
          <legend>Filter lookup</legend>
          <label><input type="radio" name="lookup-mode" value="all" checked /> All fields</label>
          <label><input type="radio" name="lookup-mode" value="english" /> English translation</label>
          <label><input type="radio" name="lookup-mode" value="sounds" /> French sounds</label>
        </fieldset>
        <div id="french-results" class="french-results" aria-live="polite"></div>
      </section>

      <section class="french-database" aria-label="French tourist phrase database">
        <div class="french-database__heading">
          <h2>Phrase database</h2>
          <p>English meaning, natural French wording, and a simple phonetic guide.</p>
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
            <tbody>${phraseTable}</tbody>
          </table>
        </div>
      </section>
      <div class="hero-controls french-page__actions">
        <a class="action french-page__back-link" href="#/">Back home</a>
      </div>
    </div>
  `;

  const input = container.querySelector("#french-search-input");
  const results = container.querySelector("#french-results");
  const filters = Array.from(container.querySelectorAll('input[name="lookup-mode"]'));

  const refresh = () => {
    const mode = filters.find((filter) => filter.checked)?.value ?? "all";
    renderPhraseResults(results, frenchTouristPhrases, input.value, mode);
  };

  input.addEventListener("input", refresh);
  filters.forEach((filter) => filter.addEventListener("change", refresh));
  refresh();
}
