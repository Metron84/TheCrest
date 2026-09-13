import test from "node:test";
import assert from "node:assert/strict";
import {
  CHARACTER_QUESTIONS,
  PILLAR_Q,
  QUESTIONS,
  SCALE,
} from "../lib/quiz-content.js";
import {
  countQuizAnswers,
  initialState,
  TOTAL_QUIZ_QUESTIONS,
} from "../lib/quiz-reducer.js";

test("countQuizAnswers and total match 17-step quiz", () => {
  assert.equal(TOTAL_QUIZ_QUESTIONS, 17);
  assert.equal(countQuizAnswers(initialState()), 0);
  const partial = {
    ...initialState(),
    scores: [1, 4, null, null, null, null, null, null, null, null, null, null],
    character: { integrity: 4, decency: null, respect: null, power: null },
  };
  assert.equal(countQuizAnswers(partial), 3);
});

test("affinity and character items are three stances", () => {
  assert.deepEqual(SCALE, [1, 4, 7]);
  for (const q of QUESTIONS) {
    assert.equal(q.a.length, 3, q.q);
  }
  for (const q of CHARACTER_QUESTIONS) {
    assert.equal(q.a.length, 3, q.q);
  }
  assert.equal(PILLAR_Q.a.length, 4);
});
