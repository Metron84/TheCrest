"use client";

import GroundScene from "@/components/GroundScene";
import { resolveClubGround } from "@/lib/club-ground-meta";
import { describeMatchClub } from "@/lib/tier";
import styles from "./GroundFinale.module.css";

/**
 * @param {{
 *   club: object | null;
 *   countryFits?: { id: string; label: string; match: { club: object; percent?: number } }[];
 *   onOpenReading: () => void;
 *   onRestart: () => void;
 * }} props
 */
export default function GroundFinale({
  club,
  countryFits = [],
  onOpenReading,
  onRestart,
}) {
  const ground = resolveClubGround(club || {});
  const displayName = club ? describeMatchClub(club) : "Your club";
  const city =
    ground.city &&
    ground.city !== "Unknown" &&
    ground.city !== "your city"
      ? ground.city
      : null;
  const primarySlug = club?.slug ?? null;

  return (
    <div className={styles.root} role="region" aria-label="Your clubs">
      <GroundScene club={club} interactive sceneOnly />
      <div className={styles.board}>
        <p className={styles.kicker}>Your club</p>
        <h1 className={styles.title}>{displayName}</h1>
        {city || ground.stadiumName ? (
          <p className={styles.place}>
            {city ? `${city}. ` : ""}
            {ground.stadiumName}
          </p>
        ) : null}

        {countryFits.length ? (
          <ol className={styles.countries}>
            {countryFits.map((row) => {
              const winner = row.match.club.slug === primarySlug;
              return (
                <li
                  key={row.id}
                  className={`${styles.country} ${winner ? styles.countryWin : ""}`}
                >
                  <span className={styles.countryName}>{row.label}</span>
                  <span className={styles.clubName}>
                    {describeMatchClub(row.match.club)}
                  </span>
                  <span className={styles.pct}>
                    {typeof row.match.percent === "number"
                      ? `${row.match.percent}%`
                      : ""}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondary}
            onClick={onOpenReading}
          >
            Full reading
          </button>
          <button type="button" className={styles.ghost} onClick={onRestart}>
            Start again
          </button>
        </div>
      </div>
    </div>
  );
}
