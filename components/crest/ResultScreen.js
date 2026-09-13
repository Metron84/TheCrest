"use client";

import { useEffect, useMemo, useState } from "react";
import { characterNarrative } from "@/lib/character-narrative";
import { selectMatches } from "@/lib/select";
import { competitionLabel, describeMatchClub } from "@/lib/tier";
import { nextStepsForClub } from "@/lib/next-steps";
import { renderShareCardPng, shareCrestCard } from "@/lib/share-card";
import Crest from "./Crest";
import InstallPrompt from "./InstallPrompt";
import Reveal from "./Reveal";
import styles from "./ResultScreen.module.css";

/**
 * @param {{
 *   scores: number[];
 *   character: { integrity: number; decency: number; respect: number; power: number };
 *   pillar: { Heart: number; Mind: number; Soul: number };
 *   ownedSlugs: string[];
 *   clubs: object[];
 *   onRestart: () => void;
 * }} props
 */
export default function ResultScreen({
  scores,
  character,
  pillar,
  ownedSlugs,
  clubs,
  onRestart,
}) {
  const result = useMemo(
    () => selectMatches(scores, clubs, pillar, ownedSlugs),
    [scores, clubs, pillar, ownedSlugs],
  );

  const characterReading = useMemo(
    () => characterNarrative(character),
    [character],
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
      <div className={styles.heroBand}>
        <div className={styles.heroGrain} aria-hidden="true" />
        <Reveal delay={0}>
          <Crest scores={scores} animate className={styles.crest} />
        </Reveal>
      </div>

      <Reveal delay={120}>
        <h2 className={styles.arch}>{result.archetype.name}</h2>
      </Reveal>
      <Reveal delay={220}>
        <p className={styles.reading}>{result.archetype.reading}</p>
      </Reveal>

      <Reveal delay={280}>
        <div className={styles.block}>
          <h3 className={styles.blockTitle}>When belonging is tested</h3>
          <p className={styles.character}>{characterReading}</p>
        </div>
      </Reveal>

      {result.emptyMessage ? (
        <Reveal delay={360}>
          <p className={styles.note}>{result.emptyMessage}</p>
        </Reveal>
      ) : null}

      {result.byCountry?.length ? (
        <Reveal delay={420}>
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>Your clubs</h3>
            <p className={styles.why}>
              One club in England, Italy, France, Spain, and Germany. From
              heart, mind, soul, and character. Percentages are relative fit
              among these five.
            </p>
            {result.byCountry.map((row) => (
              <div key={row.id} className={styles.countryRow}>
                <p className={styles.countryLabel}>{row.label}</p>
                <ClubRow match={row.match} />
              </div>
            ))}
          </div>
        </Reveal>
      ) : result.primary ? (
        <Reveal delay={420}>
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>Your affinity club</h3>
            <ClubRow match={result.primary} />
          </div>
        </Reveal>
      ) : null}

      <Reveal delay={680}>
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
      </Reveal>

      {result.showSampleNotice ? (
        <Reveal delay={760}>
          <p className={styles.sample}>
            Club scores are SAMPLE editorial estimates pending the researched
            database. Percentages are relative fit across the club set, not a
            claim about you.
          </p>
        </Reveal>
      ) : null}

      <InstallPrompt show={installReady} />
    </section>
  );
}

/** @param {{ match: { club: object; percent?: number } }} props */
function ClubRow({ match }) {
  return (
    <div className={styles.club}>
      <ClubRowInner club={match.club} />
      {typeof match.percent === "number" ? (
        <div className={styles.pct}>{match.percent}%</div>
      ) : null}
    </div>
  );
}

/** @param {{ club: object }} props */
function ClubRowInner({ club }) {
  const division = competitionLabel(club);
  const displayName = describeMatchClub(club);
  return (
    <div className={styles.clubMain}>
      {club.badge_url ? (
        <img
          src={club.badge_url}
          alt=""
          className={styles.badge}
          width={44}
          height={44}
          loading="lazy"
        />
      ) : (
        <span className={styles.badgePlaceholder} aria-hidden="true" />
      )}
      <div className={styles.clubName}>
        {displayName}
        {division && !displayName.includes("(") ? (
          <span className={styles.division}>{division}</span>
        ) : null}
        <small>{club.identity_summary}</small>
      </div>
    </div>
  );
}
