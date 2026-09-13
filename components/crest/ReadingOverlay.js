"use client";

import ResultScreen from "./ResultScreen";
import styles from "./ReadingOverlay.module.css";

/**
 * @param {{
 *   scores: number[];
 *   character: object;
 *   pillar: object;
 *   ownedSlugs: string[];
 *   clubs: object[];
 *   onClose: () => void;
 *   onRestart: () => void;
 * }} props
 */
export default function ReadingOverlay({
  scores,
  character,
  pillar,
  ownedSlugs,
  clubs,
  onClose,
  onRestart,
}) {
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Full reading">
      <div className={styles.sheet}>
        <div className={styles.closeBar}>
          <button type="button" className={styles.close} onClick={onClose}>
            Back to your club
          </button>
        </div>
        <ResultScreen
          scores={scores}
          character={character}
          pillar={pillar}
          ownedSlugs={ownedSlugs}
          clubs={clubs}
          onRestart={() => {
            onClose();
            onRestart();
          }}
        />
      </div>
    </div>
  );
}
