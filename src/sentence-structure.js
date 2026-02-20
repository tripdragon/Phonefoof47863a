import nlp from "compromise";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeText(result) {
  return result?.out?.("text") || "";
}

function safeArray(result) {
  return result?.out?.("array") || [];
}

function extractTags(term) {
  if (Array.isArray(term.tags)) {
    return term.tags;
  }

  if (term.tags && typeof term.tags === "object") {
    return Object.keys(term.tags);
  }

  return [];
}

function countTermsByTag(terms, tagName) {
  return terms.filter((term) => extractTags(term).includes(tagName)).length;
}

export function getSentenceAnalysis(sentence) {
  const doc = nlp(sentence);
  const clauses = typeof doc.clauses === "function" ? safeArray(doc.clauses()) : safeArray(doc.sentences());
  const terms = doc.terms().json({ offset: false });
  const normalizedTerms = terms.flatMap((item) => item.terms ?? []);

  const resolvedSubject = typeof doc.subjects === "function"
    ? safeText(doc.subjects())
    : safeText(doc.nouns().first());

  const resolvedVerb = safeText(doc.verbs().toInfinitive());

  return {
    clauseCount: clauses.length || 1,
    subject: resolvedSubject || "not clearly detected",
    verb: resolvedVerb || "not clearly detected",
    nounCount: countTermsByTag(normalizedTerms, "Noun"),
    verbCount: countTermsByTag(normalizedTerms, "Verb"),
    adjectiveCount: countTermsByTag(normalizedTerms, "Adjective"),
    normalizedTerms,
  };
}

export function renderSentenceStructureAnalysis(sentence) {
  const analysis = getSentenceAnalysis(sentence);
  const highlightedTokens = analysis.normalizedTerms
    .map((term) => {
      const tags = extractTags(term);
      const topTags = tags.slice(0, 2).join(", ") || "Unknown";
      return `<li><strong>${escapeHtml(term.text)}</strong> — ${escapeHtml(topTags)}</li>`;
    })
    .join("");

  return `
      <p><strong>Detected clauses:</strong> ${analysis.clauseCount}</p>
      <p><strong>Likely subject:</strong> ${escapeHtml(analysis.subject)}</p>
      <p><strong>Main verb(s):</strong> ${escapeHtml(analysis.verb)}</p>
      <p><strong>Parts of speech mix:</strong> nouns ${analysis.nounCount}, verbs ${analysis.verbCount}, adjectives ${analysis.adjectiveCount}</p>
      <details>
        <summary>Token breakdown</summary>
        <ul class="sentence-token-list">${highlightedTokens || "<li>No tokens detected.</li>"}</ul>
      </details>
    `;
}
