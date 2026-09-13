"use client";

import Reveal from "./Reveal";
import styles from "./OpeningScreen.module.css";

/** @param {{ onStart: () => void }} props */
export default function OpeningScreen({ onStart }) {
  return (
    <section className={styles.screen}>
      <Reveal delay={0}>
        <div className={styles.markRow}>
          <img
            src="/icons/icon-192.png"
            alt=""
            className={styles.markIcon}
            width={56}
            height={56}
          />
          <h1 className={styles.mark}>
            The
            <br />
            <em>Crest</em>
          </h1>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <p className={styles.standfirst}>
          Not the club that wins. The club that sounds like you.
        </p>
      </Reveal>
      <Reveal delay={180}>
        <p className={styles.note}>
          Twelve on what draws you. Four on how you act when it is tested. One on
          balance. No typing, no right answers.
        </p>
      </Reveal>
      <Reveal delay={260}>
        <button type="button" className={styles.cta} onClick={onStart}>
          Start
        </button>
      </Reveal>
    </section>
  );
}
