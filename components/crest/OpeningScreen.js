"use client";

import styles from "./OpeningScreen.module.css";

/** @param {{ onStart: () => void }} props */
export default function OpeningScreen({ onStart }) {
  return (
    <section className={styles.screen}>
      <h1 className={styles.mark}>
        The
        <br />
        <em>Crest</em>
      </h1>
      <p className={styles.standfirst}>
        Not the club that wins. The club that sounds like you.
      </p>
      <p className={styles.note}>
        Twelve questions. No typing, no right answers. Built by The Reflective
        Football.
      </p>
      <button type="button" className={styles.cta} onClick={onStart}>
        Start
      </button>
    </section>
  );
}
