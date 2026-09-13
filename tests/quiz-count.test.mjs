import test from "node:test";
import assert from "node:assert/strict";
import {
  CHARACTER_QUESTIONS,
  COLOR_Q,
  COLOR_STEP_INDEX,
  KIT_FAMILIES,
  PILLAR_Q,
  QUESTIONS,
  SCALE,
} from "../lib/quiz-content.js";
import {
  countQuizAnswers,
  initialState,
  isQuizComplete,
  quizReducer,
  TOTAL_QUIZ_QUESTIONS,
} from "../lib/quiz-reducer.js";

test("countQuizAnswers and total match 18-step quiz", () => {
  assert.equal(TOTAL_QUIZ_QUESTIONS, 18);
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
  assert.equal(COLOR_Q.q, "What is your least favourite colour?");
  assert.equal(KIT_FAMILIES.length, 12);
});

test("pillar answer opens the colour step and colour completes the quiz", () => {
  const pillar = { Heart: 0.34, Mind: 0.33, Soul: 0.33 };
  const afterPillar = quizReducer(
    { ...initialState(), step: "quiz" },
    {
      type: "ANSWER_PILLAR",
      payload: pillar,
    },
  );
  assert.equal(afterPillar.step, "quiz");
  assert.equal(afterPillar.quizIndex, COLOR_STEP_INDEX);
  assert.equal(afterPillar.hatedColor, null);
  assert.equal(isQuizComplete(afterPillar), false);

  const afterColor = quizReducer(afterPillar, {
    type: "ANSWER_COLOR",
    payload: "red",
  });
  assert.equal(afterColor.step, "complete");
  assert.equal(afterColor.hatedColor, "red");
});
