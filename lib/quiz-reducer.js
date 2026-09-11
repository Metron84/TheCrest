import { STORAGE_KEY } from "./quiz-content.js";

/** @typedef {'start' | 'owned' | 'quiz' | 'complete'} Step */

/**
 * @typedef {Object} QuizState
 * @property {Step} step
 * @property {number} quizIndex 0–11 dimension questions; 12 = pillar
 * @property {(number|null)[]} scores length 12
 * @property {string[]} ownedSlugs
 * @property {boolean} noClubYet
 * @property {{ Heart: number; Mind: number; Soul: number } | null} pillar
 */

export function initialState() {
  return {
    step: "start",
    quizIndex: 0,
    scores: Array(12).fill(null),
    ownedSlugs: [],
    noClubYet: false,
    pillar: null,
  };
}

export function loadPersistedState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      ...initialState(),
      ...parsed,
      scores: Array.isArray(parsed.scores)
        ? parsed.scores.slice(0, 12).concat(Array(12).fill(null)).slice(0, 12)
        : Array(12).fill(null),
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
      return { ...state, noClubYet: true, ownedSlugs: [] };
    case "OWNED_CONTINUE":
      return { ...state, step: "quiz", quizIndex: 0 };
    case "ANSWER_DIMENSION": {
      const { index, value } = /** @type {{ index: number; value: number }} */ (
        action.payload
      );
      const scores = [...state.scores];
      scores[index] = value;
      const nextIndex = state.quizIndex + 1;
      if (nextIndex >= 12) {
        return { ...state, scores, quizIndex: 12 };
      }
      return { ...state, scores, quizIndex: nextIndex };
    }
    case "ANSWER_PILLAR": {
      const pillar = /** @type {{ Heart: number; Mind: number; Soul: number }} */ (
        action.payload
      );
      return { ...state, pillar, step: "complete" };
    }
    case "BACK": {
      if (state.step === "quiz" && state.quizIndex === 12) {
        return { ...state, quizIndex: 11 };
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
