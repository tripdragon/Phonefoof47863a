import test from "node:test";
import assert from "node:assert/strict";

import { getSentenceAnalysis, renderSentenceStructureAnalysis } from "../src/sentence-structure.js";

test("getSentenceAnalysis returns expected structure for a simple sentence", () => {
  const analysis = getSentenceAnalysis("The bright fox jumps over the fence.");

  assert.ok(analysis.clauseCount >= 1);
  assert.ok(analysis.nounCount >= 1);
  assert.ok(analysis.verbCount >= 1);
  assert.notEqual(analysis.verb, "not clearly detected");
  assert.match(analysis.subject.toLowerCase(), /fox/);
  assert.match(analysis.verb.toLowerCase(), /jump/);
  assert.ok(Array.isArray(analysis.normalizedTerms));
  assert.ok(analysis.normalizedTerms.length > 0);
});

test("getSentenceAnalysis falls back when no subject is detected", () => {
  const analysis = getSentenceAnalysis("Run!");
  assert.equal(typeof analysis.subject, "string");
  assert.notEqual(analysis.subject.trim(), "");
});

test("renderSentenceStructureAnalysis escapes HTML in token text", () => {
  const html = renderSentenceStructureAnalysis("<script>alert('xss')</script> birds fly");

  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<strong><script>/);
  assert.match(html, /Detected clauses:/);
});
