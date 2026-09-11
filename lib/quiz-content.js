/** @typedef {{ Heart: number; Mind: number; Soul: number }} PillarWeights */

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

export const QUESTIONS = [
  {
    d: 0,
    q: "A club wins nothing for fifteen years. What is that?",
    a: [
      "A failure, and I would not sign up for it",
      "Hard to justify to anyone",
      "Part of football",
      "Where the real supporters are made",
      "The whole point, and the reason it means something",
    ],
  },
  {
    d: 1,
    q: "Pick the season you would rather live through.",
    a: [
      "Won it by twelve points, never in doubt",
      "Comfortable, a couple of scares",
      "Middling, one good cup run",
      "Survived on the last day, barely",
      "Three comebacks, two collapses, decided in stoppage time",
    ],
  },
  {
    d: 2,
    q: "Someone asks who you support.",
    a: [
      "I like that everyone instantly knows them",
      "Easy to explain, easy to share",
      "I do not think about it",
      "I enjoy that it needs explaining",
      "I would rather nobody in the room had heard of them",
    ],
  },
  {
    d: 3,
    q: "Twenty years from now, what do you want to remember?",
    a: [
      "The trophies",
      "The big nights",
      "A bit of both",
      "The away days and the people",
      "The ritual of it, whatever we won",
    ],
  },
  {
    d: 4,
    q: "Your team wins ugly, all season.",
    a: [
      "Take the trophy and say nothing",
      "Winning is winning",
      "Depends who we beat",
      "It would start to grate",
      "I would rather lose playing properly",
    ],
  },
  {
    d: 5,
    q: "A manager can have either of these.",
    a: [
      "A defence that never breaks",
      "A plan for every opponent",
      "A balanced side",
      "Players allowed to improvise",
      "A team that gambles and sometimes falls apart",
    ],
  },
  {
    d: 6,
    q: "A place opens up in the first team.",
    a: [
      "Sign the best available player",
      "Buy well, buy proven",
      "Whoever is ready",
      "Promote from the academy",
      "Promote from the academy even if we drop points for it",
    ],
  },
  {
    d: 7,
    q: "Every new manager arrives with their own ideas.",
    a: [
      "Good, adapt to whoever wins",
      "Flexibility is a strength",
      "Take it case by case",
      "The club should have a way of playing",
      "The club's way outlives any manager",
    ],
  },
  {
    d: 8,
    q: "Where should a club belong?",
    a: [
      "To the world, and the bigger the better",
      "To its supporters everywhere",
      "Both at once",
      "To its city first",
      "To its streets, and it should feel like a trespass to buy in",
    ],
  },
  {
    d: 9,
    q: "The club wants to modernise: new badge, new stadium, new sound.",
    a: [
      "Good, football has to move",
      "Refresh it carefully",
      "No strong view",
      "Keep the songs and the badge",
      "Change nothing that was inherited",
    ],
  },
  {
    d: 10,
    q: "Which club would you rather be part of?",
    a: [
      "One that sets the standard everyone else measures against",
      "One with real power and expectation",
      "Neither especially",
      "One that annoys the people in charge",
      "One that exists in opposition to the whole system",
    ],
  },
  {
    d: 11,
    q: "What is football to you?",
    a: [
      "A good way to spend a Saturday",
      "Entertainment, and I want it to be fun",
      "A serious hobby",
      "Part of who I am",
      "A language I understand people through",
    ],
  },
];

export const PILLAR_Q = {
  q: "Last one. What decides it for you?",
  a: [
    { t: "How a club makes me feel", w: { Heart: 0.5, Mind: 0.25, Soul: 0.25 } },
    { t: "How a club plays and thinks", w: { Heart: 0.25, Mind: 0.5, Soul: 0.25 } },
    { t: "What a club stands for", w: { Heart: 0.25, Mind: 0.25, Soul: 0.5 } },
    { t: "All three, equally", w: { Heart: 0.34, Mind: 0.33, Soul: 0.33 } },
  ],
};

export const STORAGE_KEY = "crest-quiz-v1";
export const INSTALL_SEEN_KEY = "crest-install-prompt-seen";
