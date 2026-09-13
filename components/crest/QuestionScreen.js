"use client";

import {
  AFFINITY_COUNT,
  CHARACTER_QUESTIONS,
  PILLAR_Q,
  PILLAR_STEP_INDEX,
  QUESTIONS,
  QUIZ_STEP_COUNT,
  SCALE,
} from "@/lib/quiz-content";
import ProgressRail from "./ProgressRail";
import BackButton from "./BackButton";
import styles from "./QuestionScreen.module.css";

/**
 * @param {{
 *   quizIndex: number;
 *   scores: (number|null)[];
 *   character: { integrity: number|null; decency: number|null; respect: number|null; power: number|null };
 *   onAnswerDimension: (index: number, value: number) => void;
 *   onAnswerCharacter: (key: string, value: number) => void;
 *   onAnswerPillar: (w: { Heart: number; Mind: number; Soul: number }) => void;
 *   onBack: () => void;
 *   journey?: boolean;
 * }} props
 */
export default function QuestionScreen({
  quizIndex,
  scores,
  character,
  onAnswerDimension,
  onAnswerCharacter,
  onAnswerPillar,
  onBack,
  journey = false,
}) {
  const isPillar = quizIndex >= PILLAR_STEP_INDEX;
  const isCharacter =
    quizIndex >= AFFINITY_COUNT && quizIndex < PILLAR_STEP_INDEX;
  const charIndex = isCharacter ? quizIndex - AFFINITY_COUNT : 0;

  const questionText = isPillar
    ? PILLAR_Q.q
    : isCharacter
      ? CHARACTER_QUESTIONS[charIndex].q
      : QUESTIONS[quizIndex].q;

  const options = isPillar
    ? PILLAR_Q.a.map((o) => ({ label: o.t, pillar: o.w }))
    : isCharacter
      ? CHARACTER_QUESTIONS[charIndex].a.map((label, i) => ({
          label,
          value: SCALE[i],
          charKey: CHARACTER_QUESTIONS[charIndex].key,
        }))
      : QUESTIONS[quizIndex].a.map((label, i) => ({
          label,
          value: SCALE[i],
        }));

  const selected = isPillar
    ? null
    : isCharacter
      ? character[CHARACTER_QUESTIONS[charIndex].key]
      : scores[quizIndex];

  return (
    <section
      className={`${styles.screen} ${journey ? styles.screenJourney : ""}`}
    >
      <ProgressRail
        activeIndex={quizIndex}
        total={QUIZ_STEP_COUNT}
        journey={journey}
      />
      <div className={styles.split}>
        <div className={styles.prompt}>
          <h2 className={styles.q}>{questionText}</h2>
        </div>
        <div className={styles.opts} role="group" aria-label={questionText}>
          {options.map((opt, i) => {
            const picked =
              !isPillar &&
              typeof opt.value === "number" &&
              selected === opt.value;
            return (
              <button
                key={i}
                type="button"
                className={`${styles.opt} ${picked ? styles.picked : ""}`}
                onClick={() => {
                  if (isPillar && opt.pillar) {
                    onAnswerPillar(opt.pillar);
                  } else if (isCharacter && opt.charKey && typeof opt.value === "number") {
                    onAnswerCharacter(opt.charKey, opt.value);
                  } else if (typeof opt.value === "number") {
                    onAnswerDimension(quizIndex, opt.value);
                  }
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
      <BackButton onBack={onBack} journey={journey} />
    </section>
  );
}
