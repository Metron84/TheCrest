"use client";

import { DIMS, QUESTIONS, PILLAR_Q, SCALE } from "@/lib/quiz-content";
import ProgressRail from "./ProgressRail";
import BackButton from "./BackButton";
import styles from "./QuestionScreen.module.css";

/**
 * @param {{
 *   quizIndex: number;
 *   scores: (number|null)[];
 *   onAnswerDimension: (index: number, value: number) => void;
 *   onAnswerPillar: (w: { Heart: number; Mind: number; Soul: number }) => void;
 *   onBack: () => void;
 * }} props
 */
export default function QuestionScreen({
  quizIndex,
  scores,
  onAnswerDimension,
  onAnswerPillar,
  onBack,
}) {
  const isPillar = quizIndex >= 12;
  const dimIndex = isPillar ? 11 : quizIndex;
  const pillarLabel = isPillar ? "Balance" : DIMS[dimIndex].pillar;
  const questionText = isPillar ? PILLAR_Q.q : QUESTIONS[quizIndex].q;
  const options = isPillar
    ? PILLAR_Q.a.map((o) => ({ label: o.t, pillar: o.w }))
    : QUESTIONS[quizIndex].a.map((label, i) => ({
        label,
        value: SCALE[i],
      }));

  const selected = isPillar ? null : scores[quizIndex];

  return (
    <section className={styles.screen}>
      <ProgressRail activeIndex={isPillar ? 12 : quizIndex} />
      <div className={styles.split}>
        <div className={styles.prompt}>
          <p className={styles.pillar}>{pillarLabel}</p>
          <h2 className={styles.q}>{questionText}</h2>
        </div>
        <div className={styles.opts} role="group" aria-label={questionText}>
          {options.map((opt, i) => {
            const picked =
              !isPillar && typeof opt.value === "number" && selected === opt.value;
            return (
              <button
                key={i}
                type="button"
                className={`${styles.opt} ${picked ? styles.picked : ""}`}
                onClick={() => {
                  if (isPillar && opt.pillar) {
                    onAnswerPillar(opt.pillar);
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
      <BackButton onBack={onBack} />
    </section>
  );
}
