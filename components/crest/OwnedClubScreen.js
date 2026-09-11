"use client";

import styles from "./OwnedClubScreen.module.css";

/**
 * @param {{
 *   clubs: { slug: string; name: string }[];
 *   ownedSlugs: string[];
 *   noClubYet: boolean;
 *   onToggle: (slug: string) => void;
 *   onNoClub: () => void;
 *   onContinue: () => void;
 *   onBack: () => void;
 * }} props
 */
export default function OwnedClubScreen({
  clubs,
  ownedSlugs,
  noClubYet,
  onToggle,
  onNoClub,
  onContinue,
  onBack,
}) {
  const sorted = [...clubs].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className={styles.screen}>
      <p className={styles.pillar}>Before we start</p>
      <h2 className={styles.q}>Do you already have a club?</h2>
      <div className={styles.scroller}>
        <div className={styles.grid}>
          {sorted.map((club) => {
            const picked = ownedSlugs.includes(club.slug);
            return (
              <button
                key={club.slug}
                type="button"
                className={`${styles.chip} ${picked ? styles.picked : ""}`}
                aria-pressed={picked}
                onClick={() => onToggle(club.slug)}
              >
                {club.name}
              </button>
            );
          })}
          <button
            type="button"
            className={`${styles.chip} ${styles.wide} ${noClubYet ? styles.picked : ""}`}
            aria-pressed={noClubYet}
            onClick={onNoClub}
          >
            No club yet
          </button>
        </div>
      </div>
      <button type="button" className={styles.cta} onClick={onContinue}>
        Continue
      </button>
      <button type="button" className={styles.back} onClick={onBack}>
        Back
      </button>
    </section>
  );
}
