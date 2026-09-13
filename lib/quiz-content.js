/** @typedef {{ Heart: number; Mind: number; Soul: number }} PillarWeights */

/** @typedef {{ integrity: number; decency: number; respect: number; power: number }} CharacterVector */

export const AFFINITY_COUNT = 12;
export const CHARACTER_COUNT = 4;
/** Affinity + Character + one Balance (pillar) question. */
export const QUIZ_STEP_COUNT = AFFINITY_COUNT + CHARACTER_COUNT + 1;
export const PILLAR_STEP_INDEX = AFFINITY_COUNT + CHARACTER_COUNT;

export const DIMS = [
  { id: "H1", pillar: "Heart", low: "Success", high: "Suffering" },
  { id: "H2", pillar: "Heart", low: "Calm", high: "Volatile" },
  { id: "H3", pillar: "Heart", low: "Belonging", high: "Distinction" },
  { id: "H4", pillar: "Heart", low: "Glory", high: "Journey" },
  { id: "M1", pillar: "Mind", low: "Results", high: "Aesthetics" },
  { id: "M2", pillar: "Mind", low: "Control", high: "Risk" },
  { id: "M3", pillar: "Mind", low: "Acquisition", high: "Development" },
  { id: "M4", pillar: "Mind", low: "Adaptability", high: "Ideology" },
  { id: "S1", pillar: "Soul", low: "Global", high: "Local" },
  { id: "S2", pillar: "Soul", low: "Modernity", high: "Heritage" },
  { id: "S3", pillar: "Soul", low: "Establishment", high: "Defiance" },
  { id: "S4", pillar: "Soul", low: "Entertainment", high: "Meaning" },
];

export const SCALE = [1, 2.5, 4, 5.5, 7];

/** Meaning-locked items: surface is hypothetical; poles map 1→7 as in the club codebook. */
export const QUESTIONS = [
  {
    d: 0,
    q: "You are considering a cause that may struggle for years. What would make you stay?",
    a: [
      "A strong expectation that it will succeed",
      "Clear signs that success is getting closer",
      "Belief that the cause deserves a fair chance",
      "Loyalty when progress is painfully slow",
      "A bond that grows stronger through hardship",
    ],
  },
  {
    d: 1,
    q: "You can choose the shape of an important year. Which would you rather live through?",
    a: [
      "Steady progress, with little left to chance",
      "Mostly calm, with a few testing moments",
      "A balance of certainty and surprise",
      "Sharp turns that keep everything alive",
      "Wild swings, high drama and no guarantees",
    ],
  },
  {
    d: 2,
    q: "A new community welcomes you. What kind of belonging feels most meaningful?",
    a: [
      "A wide circle where everyone feels included",
      "An open group that is easy to share",
      "A community with both reach and character",
      "A smaller circle with its own codes",
      "A rare bond that only a few truly understand",
    ],
  },
  {
    d: 3,
    q: "Looking back on a long commitment, what would make it feel worthwhile?",
    a: [
      "The milestones reached",
      "The proudest moments",
      "The achievements and memories together",
      "The routines, places and people",
      "The years of showing up, whatever happened",
    ],
  },
  {
    d: 4,
    q: "You can complete something important in several ways. What matters most?",
    a: [
      "The strongest result, reached by any fair method",
      "The result first, with good craft as a bonus",
      "A balance between the result and the method",
      "Protecting the craft, even at some cost",
      "Doing it beautifully, even if the result suffers",
    ],
  },
  {
    d: 5,
    q: "You are leading an ambitious project. How much uncertainty would you allow?",
    a: [
      "Very little, with a clear system throughout",
      "A little, within a careful plan",
      "Enough to balance structure and freedom",
      "A lot, with space for bold improvisation",
      "As much as bold work needs, even if it unravels",
    ],
  },
  {
    d: 6,
    q: "An organisation needs someone for a demanding role. Who should get the chance?",
    a: [
      "The best proven expert it can bring in",
      "An experienced person ready from day one",
      "The best fit, whatever their background",
      "A promising person already inside",
      "Someone grown from within, even if they need time",
    ],
  },
  {
    d: 7,
    q: "An institution faces a changing world. How should it respond?",
    a: [
      "Reinvent itself whenever the moment demands",
      "Adapt freely while keeping a few principles",
      "Balance changing methods with continuity",
      "Let a clear philosophy guide each change",
      "Keep one lasting philosophy across every era",
    ],
  },
  {
    d: 8,
    q: "A cultural institution is growing beyond its birthplace. Who should it belong to?",
    a: [
      "Everyone it can reach around the world",
      "Its wider community, wherever they live",
      "Both its wider audience and its home",
      "Its home community before anyone else",
      "The streets that shaped it, first and always",
    ],
  },
  {
    d: 9,
    q: "You inherit a treasured institution that must prepare for the future. What approach feels right?",
    a: [
      "Reimagine it freely for the present",
      "Refresh it, keeping a few familiar signs",
      "Balance renewal with inheritance",
      "Change only what the future truly requires",
      "Protect what was handed down, even from fashion",
    ],
  },
  {
    d: 10,
    q: "A powerful system offers you a place within it. What appeals most?",
    a: [
      "Helping set the standard from the centre",
      "Using influence to improve how things work",
      "Choosing the role that best serves the purpose",
      "Keeping enough distance to challenge authority",
      "Standing outside it and resisting its rules",
    ],
  },
  {
    d: 11,
    q: "You return to the same pastime every week. What do you want from it?",
    a: [
      "A pleasant break from ordinary life",
      "Enjoyment and something to look forward to",
      "A lasting interest that matters to me",
      "A ritual that becomes part of who I am",
      "A language for understanding myself and others",
    ],
  },
];

/** Character lens: narrative only, not used in club-distance matching. */
export const CHARACTER_DIMS = [
  { id: "C1", key: "integrity", theme: "Integrity", low: "Procedure", high: "Conscience" },
  { id: "C3", key: "decency", theme: "Decency", low: "Loyalty", high: "Impartiality" },
  { id: "C2", key: "respect", theme: "Respect", low: "Accountability", high: "Dignity" },
  { id: "C5", key: "power", theme: "Power", low: "Reform", high: "Resistance" },
];

export const CHARACTER_QUESTIONS = [
  {
    key: "integrity",
    q: "A rule gives your group an advantage that feels contrary to its spirit. What guides you?",
    a: [
      "Use the rule as it was written",
      "Use it unless the unfairness is serious",
      "Balance the written rule with wider fairness",
      "Put fairness before a technical advantage",
      "Follow my conscience, even when it costs us",
    ],
  },
  {
    key: "decency",
    q: "A close friend asks you to defend something you believe was wrong. What do you do?",
    a: [
      "Stand beside them and challenge them privately",
      "Defend the person without defending the action",
      "Say only what I honestly know to be true",
      "Disagree openly while treating them with respect",
      "Withhold my support until they try to repair the harm",
    ],
  },
  {
    key: "respect",
    q: "Someone who treated you badly is humiliated in front of everyone. How do you respond?",
    a: [
      "Let the consequences speak for themselves",
      "Stay out of it and do not add to the humiliation",
      "Offer the same basic respect I would offer anyone",
      "Protect their dignity despite what happened",
      "Help them recover without expecting anything back",
    ],
  },
  {
    key: "power",
    q: "A neutral-looking rule places a heavier burden on people with less influence. What do you do?",
    a: [
      "Apply it consistently while gathering evidence",
      "Seek exceptions when the burden is clear",
      "Question it through the proper channels",
      "Bring affected people together to challenge it",
      "Resist it openly until the rule is reconsidered",
    ],
  },
];

export const CHARACTER_INTRO =
  "When loyalty and principle pull against each other, what do you do?";

export const PILLAR_Q = {
  q: "Last one. When you feel drawn to an institution, what matters most?",
  a: [
    { t: "How it makes me feel", w: { Heart: 0.5, Mind: 0.25, Soul: 0.25 } },
    { t: "How it thinks and creates", w: { Heart: 0.25, Mind: 0.5, Soul: 0.25 } },
    { t: "What it stands for", w: { Heart: 0.25, Mind: 0.25, Soul: 0.5 } },
    { t: "All three equally", w: { Heart: 0.34, Mind: 0.33, Soul: 0.33 } },
  ],
};

export const STORAGE_KEY = "crest-quiz-v2";
export const INSTALL_SEEN_KEY = "crest-install-prompt-seen";
