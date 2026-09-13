import test from "node:test";
import assert from "node:assert/strict";
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
    scores: [1, 2.5, null, null, null, null, null, null, null, null, null, null],
    character: { integrity: 4, decency: null, respect: null, power: null },
  };
  assert.equal(countQuizAnswers(partial), 3);
});
