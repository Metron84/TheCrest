"use client";

import LandingBeacon from "./LandingBeacon";
import Reveal from "./Reveal";
import styles from "./OpeningScreen.module.css";

/** @param {{ onStart: () => void }} props */
export default function OpeningScreen({ onStart }) {
  return (
    <section className={styles.screen}>
      <div className={styles.center}>
        <LandingBeacon />
      </div>

      <div className={styles.foot}>
        <Reveal delay={80}>
          <h1 className={styles.mark}>
            The <em>Crest</em>
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <p className={styles.line}>The club that sounds like you.</p>
        </Reveal>
        <Reveal delay={280}>
          <button type="button" className={styles.start} onClick={onStart}>
            Begin the journey
          </button>
        </Reveal>
      </div>
    </section>
  );
}
