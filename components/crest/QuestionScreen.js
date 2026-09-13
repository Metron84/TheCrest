"use client";

import {
  AFFINITY_COUNT,
  CHARACTER_QUESTIONS,
  COLOR_Q,
  COLOR_STEP_INDEX,
  KIT_FAMILIES,
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
 *   hatedColor?: string|null;
 *   onAnswerDimension: (index: number, value: number) => void;
 *   onAnswerCharacter: (key: string, value: number) => void;
 *   onAnswerPillar: (w: { Heart: number; Mind: number; Soul: number }) => void;
 *   onAnswerColor: (color: string) => void;
 *   onBack: () => void;
 *   journey?: boolean;
 * }} props
 */
export default function QuestionScreen({
  quizIndex,
  scores,
  character,
  hatedColor = null,
  onAnswerDimension,
  onAnswerCharacter,
  onAnswerPillar,
  onAnswerColor,
  onBack,
  journey = false,
}) {
  const isColor = quizIndex >= COLOR_STEP_INDEX;
  const isPillar = quizIndex === PILLAR_STEP_INDEX;
  const isCharacter =
    quizIndex >= AFFINITY_COUNT && quizIndex < PILLAR_STEP_INDEX;
  const charIndex = isCharacter ? quizIndex - AFFINITY_COUNT : 0;

  const questionText = isColor
    ? COLOR_Q.q
    : isPillar
      ? PILLAR_Q.q
      : isCharacter
        ? CHARACTER_QUESTIONS[charIndex].q
        : QUESTIONS[quizIndex].q;

  const options = isColor
    ? []
    : isPillar
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

  const selected = isColor
    ? hatedColor
    : isPillar
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
          {isColor ? <p className={styles.lead}>{COLOR_Q.lead}</p> : null}
        </div>
        {isColor ? (
          <div className={styles.colorGrid} role="group" aria-label={questionText}>
            {KIT_FAMILIES.map((color) => {
              const picked = selected === color;
              return (
                <button
                  key={color}
                  type="button"
                  className={`${styles.colorChip} ${picked ? styles.colorPicked : ""}`}
                  aria-pressed={picked}
                  onClick={() => onAnswerColor(color)}
                >
                  <span
                    className={`${styles.swatch} ${styles[`swatch_${color}`]}`}
                    aria-hidden="true"
                  />
                  <span className={styles.colorName}>{color}</span>
                </button>
              );
            })}
          </div>
        ) : (
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
        )}
      </div>
      <BackButton onBack={onBack} journey={journey} />
    </section>
  );
}
