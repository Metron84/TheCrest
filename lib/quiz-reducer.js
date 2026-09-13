import {
  AFFINITY_COUNT,
  PILLAR_STEP_INDEX,
  QUIZ_STEP_COUNT,
  STORAGE_KEY,
} from "./quiz-content.js";

export { QUIZ_STEP_COUNT as TOTAL_QUIZ_QUESTIONS };

/** @typedef {'start' | 'owned' | 'quiz' | 'complete'} Step */

/**
 * @typedef {Object} CharacterScores
 * @property {number|null} integrity
 * @property {number|null} decency
 * @property {number|null} respect
 * @property {number|null} power
 */

/**
 * @typedef {Object} QuizState
 * @property {Step} step
 * @property {number} quizIndex 0–11 affinity; 12–15 character; 16 pillar
 * @property {(number|null)[]} scores length 12
 * @property {CharacterScores} character
 * @property {string[]} ownedSlugs
 * @property {boolean} noClubYet
 * @property {{ Heart: number; Mind: number; Soul: number } | null} pillar
 */

export function emptyCharacter() {
  return {
    integrity: null,
    decency: null,
    respect: null,
    power: null,
  };
}

export function initialState() {
  return {
    step: "start",
    quizIndex: 0,
    scores: Array(AFFINITY_COUNT).fill(null),
    character: emptyCharacter(),
    ownedSlugs: [],
    noClubYet: false,
    pillar: null,
  };
}

export function isCharacterComplete(character) {
  return (
    character.integrity != null &&
    character.decency != null &&
    character.respect != null &&
    character.power != null
  );
}

export function isQuizComplete(state) {
  return (
    state.scores.every((s) => s != null) &&
    isCharacterComplete(state.character) &&
    state.pillar != null
  );
}

/** @param {QuizState} state */
export function countQuizAnswers(state) {
  let n = 0;
  for (const s of state.scores) {
    if (s != null) n += 1;
  }
  const c = state.character;
  if (c.integrity != null) n += 1;
  if (c.decency != null) n += 1;
  if (c.respect != null) n += 1;
  if (c.power != null) n += 1;
  if (state.pillar != null) n += 1;
  return n;
}

export function loadPersistedState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const scores = Array.isArray(parsed.scores)
      ? parsed.scores.slice(0, AFFINITY_COUNT).concat(Array(AFFINITY_COUNT).fill(null)).slice(0, AFFINITY_COUNT)
      : Array(AFFINITY_COUNT).fill(null);
    const character = {
      ...emptyCharacter(),
      ...(parsed.character && typeof parsed.character === "object"
        ? parsed.character
        : {}),
    };
    return {
      ...initialState(),
      ...parsed,
      scores,
      character,
      ownedSlugs: Array.isArray(parsed.ownedSlugs) ? parsed.ownedSlugs : [],
    };
  } catch {
    return null;
  }
}

export function persistState(state) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode */
  }
}

export function clearPersistedState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * @param {QuizState} state
 * @param {{ type: string; payload?: unknown }} action
 */
export function quizReducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, step: "owned" };
    case "TOGGLE_OWNED": {
      const slug = /** @type {string} */ (action.payload);
      const has = state.ownedSlugs.includes(slug);
      return {
        ...state,
        noClubYet: false,
        ownedSlugs: has
          ? state.ownedSlugs.filter((s) => s !== slug)
          : [...state.ownedSlugs, slug],
      };
    }
    case "NO_CLUB_YET":
      return {
        ...state,
        noClubYet: true,
        ownedSlugs: [],
        step: "quiz",
        quizIndex: 0,
      };
    case "CHOOSE_OWNED":
      return {
        ...state,
        noClubYet: false,
        ownedSlugs: [/** @type {string} */ (action.payload)],
        step: "quiz",
        quizIndex: 0,
      };
    case "OWNED_CONTINUE":
      return { ...state, step: "quiz", quizIndex: 0 };
    case "ANSWER_DIMENSION": {
      const { index, value } = /** @type {{ index: number; value: number }} */ (
        action.payload
      );
      const scores = [...state.scores];
      scores[index] = value;
      const nextIndex = state.quizIndex + 1;
      if (nextIndex >= AFFINITY_COUNT) {
        return { ...state, scores, quizIndex: AFFINITY_COUNT };
      }
      return { ...state, scores, quizIndex: nextIndex };
    }
    case "ANSWER_CHARACTER": {
      const { key, value } = /** @type {{ key: string; value: number }} */ (
        action.payload
      );
      const character = { ...state.character, [key]: value };
      const nextIndex = state.quizIndex + 1;
      if (nextIndex >= PILLAR_STEP_INDEX) {
        return { ...state, character, quizIndex: PILLAR_STEP_INDEX };
      }
      return { ...state, character, quizIndex: nextIndex };
    }
    case "ANSWER_PILLAR": {
      const pillar = /** @type {{ Heart: number; Mind: number; Soul: number }} */ (
        action.payload
      );
      return { ...state, pillar, step: "complete" };
    }
    case "BACK": {
      if (state.step === "quiz" && state.quizIndex === PILLAR_STEP_INDEX) {
        return { ...state, quizIndex: PILLAR_STEP_INDEX - 1 };
      }
      if (state.step === "quiz" && state.quizIndex > AFFINITY_COUNT) {
        return { ...state, quizIndex: state.quizIndex - 1 };
      }
      if (state.step === "quiz" && state.quizIndex === AFFINITY_COUNT) {
        return { ...state, quizIndex: AFFINITY_COUNT - 1 };
      }
      if (state.step === "quiz" && state.quizIndex > 0) {
        return { ...state, quizIndex: state.quizIndex - 1 };
      }
      if (state.step === "quiz" && state.quizIndex === 0) {
        return { ...state, step: "owned" };
      }
      if (state.step === "owned") {
        return { ...state, step: "start" };
      }
      return state;
    }
    case "RESTART":
      clearPersistedState();
      return initialState();
    default:
      return state;
  }
}
