"use client";

import { useEffect, useMemo, useState } from "react";
import { selectMatches } from "@/lib/select";
import { nextStepsForClub } from "@/lib/next-steps";
import { renderShareCardPng, shareCrestCard } from "@/lib/share-card";
import Crest from "./Crest";
import InstallPrompt from "./InstallPrompt";
import styles from "./ResultScreen.module.css";

/**
 * @param {{
 *   scores: number[];
 *   pillar: { Heart: number; Mind: number; Soul: number };
 *   ownedSlugs: string[];
 *   clubs: object[];
 *   onRestart: () => void;
 * }} props
 */
export default function ResultScreen({
  scores,
  pillar,
  ownedSlugs,
  clubs,
  onRestart,
}) {
  const result = useMemo(
    () => selectMatches(scores, clubs, pillar, ownedSlugs),
    [scores, clubs, pillar, ownedSlugs],
  );

  const [shareState, setShareState] = useState("idle");
  const [installReady, setInstallReady] = useState(false);

  useEffect(() => {
    setInstallReady(true);
  }, []);

  async function onShare() {
    if (!result.primary) return;
    setShareState("working");
    try {
      const blob = await renderShareCardPng(
        scores,
        result.archetype.name,
        result.primary.club.name,
      );
      const outcome = await shareCrestCard(blob, result.archetype.name);
      setShareState(outcome === "shared" ? "shared" : "saved");
    } catch {
      setShareState("error");
    }
  }

  const nextPrimary = result.primary
    ? nextStepsForClub(result.primary.club)
    : { label: "Explore The Reflective Football", href: "https://thereflectivefootball.com" };

  return (
    <section className={styles.screen}>
      <div className={styles.crestWrap}>
        <Crest scores={scores} className={styles.crest} />
      </div>

      <h2 className={styles.arch}>{result.archetype.name}</h2>
      <p className={styles.reading}>{result.archetype.reading}</p>

      {result.emptyMessage ? (
        <p className={styles.note}>{result.emptyMessage}</p>
      ) : null}

      {result.primary ? (
        <div className={styles.block}>
          <h3 className={styles.blockTitle}>Your affinity club</h3>
          <ClubRow match={result.primary} />
          <p className={styles.why}>
            Closest on {result.primary.reason}. A club to explore alongside the
            one you already carry.
          </p>
        </div>
      ) : null}

      {result.neighbours.length ? (
        <div className={styles.block}>
          <h3 className={styles.blockTitle}>Near neighbours</h3>
          {result.neighbours.map((match) => (
            <div key={match.club.slug}>
              <ClubRow match={match} />
              <p className={styles.why}>Closest on {match.reason}.</p>
            </div>
          ))}
        </div>
      ) : null}

      {result.admireFromAfar ? (
        <div className={styles.block}>
          <h3 className={styles.blockTitle}>Admire from afar</h3>
          <div className={styles.club}>
            <div className={styles.clubName}>
              {result.admireFromAfar.club.name}
              <small>{result.admireFromAfar.club.identity_summary}</small>
            </div>
          </div>
          <p className={styles.why}>
            {result.admireLine} Closest on {result.admireFromAfar.reason}.
          </p>
        </div>
      ) : null}

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Next</h3>
        <a className={styles.ctaLink} href={nextPrimary.href} target="_blank" rel="noopener noreferrer">
          {nextPrimary.label}
        </a>
        <button type="button" className={styles.cta} onClick={onShare} disabled={shareState === "working" || !result.primary}>
          {shareState === "working"
            ? "Preparing your crest…"
            : shareState === "shared"
              ? "Shared"
              : shareState === "saved"
                ? "Saved to your device"
                : "Save my crest"}
        </button>
        {shareState === "error" ? (
          <p className={styles.shareError}>Could not build the share image. Try again.</p>
        ) : null}
        <button type="button" className={`${styles.cta} ${styles.ghost}`} onClick={onRestart}>
          Start again
        </button>
      </div>

      {result.showSampleNotice ? (
        <p className={styles.sample}>
          Club scores are SAMPLE editorial estimates pending the researched
          database. Percentages are relative fit across the club set, not a
          claim about you.
        </p>
      ) : null}

      <InstallPrompt show={installReady} />
    </section>
  );
}

/** @param {{ match: { club: { name: string; identity_summary?: string }; percent?: number } }} props */
function ClubRow({ match }) {
  return (
    <div className={styles.club}>
      <div className={styles.clubName}>
        {match.club.name}
        <small>{match.club.identity_summary}</small>
      </div>
      {typeof match.percent === "number" ? (
        <div className={styles.pct}>{match.percent}%</div>
      ) : null}
    </div>
  );
}
