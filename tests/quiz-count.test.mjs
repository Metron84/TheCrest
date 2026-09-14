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
  assert.equal(COLOR_Q.q, "Which colours do you want least?");
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
  assert.deepEqual(afterPillar.hatedColors, []);
  assert.equal(isQuizComplete(afterPillar), false);

  const afterFirst = quizReducer(afterPillar, {
    type: "ANSWER_COLOR",
    payload: "red",
  });
  assert.equal(afterFirst.step, "quiz");
  assert.deepEqual(afterFirst.hatedColors, ["red"]);

  const afterSecond = quizReducer(afterFirst, {
    type: "ANSWER_COLOR",
    payload: "blue",
  });
  assert.equal(afterSecond.step, "quiz");

  const afterThird = quizReducer(afterSecond, {
    type: "ANSWER_COLOR",
    payload: "white",
  });
  assert.equal(afterThird.step, "complete");
  assert.deepEqual(afterThird.hatedColors, ["red", "blue", "white"]);
  assert.equal(isQuizComplete({ ...afterThird, scores: Array(12).fill(4), character: { integrity: 4, decency: 4, respect: 4, power: 4 } }), true);
});
