import test from "node:test";
import assert from "node:assert/strict";
import { characterNarrative } from "../lib/character-narrative.js";

test("characterNarrative returns non-empty prose", () => {
  const text = characterNarrative({
    integrity: 7,
    decency: 5.5,
    respect: 7,
    power: 4,
  });
  assert.ok(text.length > 80);
  assert.match(text, /loyalty|fairness|dignity/i);
});

test("characterNarrative does not emit a single moral score", () => {
  const text = characterNarrative({
    integrity: 1,
    decency: 1,
    respect: 1,
    power: 1,
  });
  assert.doesNotMatch(text, /\d+%/);
  assert.doesNotMatch(text, /good person|bad person/i);
});
