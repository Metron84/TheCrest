"use client";

import GroundScene from "@/components/GroundScene";
import styles from "./GroundFinale.module.css";

/**
 * @param {{
 *   club: object | null;
 *   onOpenReading: () => void;
 *   onRestart: () => void;
 * }} props
 */
export default function GroundFinale({ club, onOpenReading, onRestart }) {
  return (
    <div className={styles.root} role="region" aria-label="Your club">
      <GroundScene club={club} interactive />
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onOpenReading}>
          Archetype and neighbours
        </button>
        <button type="button" className={styles.ghost} onClick={onRestart}>
          Start again
        </button>
      </div>
    </div>
  );
}
