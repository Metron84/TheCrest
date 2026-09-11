"use client";

import styles from "./BackButton.module.css";

/** @param {{ onBack: () => void; hidden?: boolean }} props */
export default function BackButton({ onBack, hidden }) {
  if (hidden) return null;
  return (
    <button type="button" className={styles.back} onClick={onBack}>
      Back
    </button>
  );
}
