"use client";

import { useMemo, useState } from "react";
import { groupClubsForOwnedPicker } from "@/lib/owned-club-groups";
import styles from "./OwnedClubScreen.module.css";

/**
 * @param {{
 *   clubs: { slug: string; name: string; competition?: string | null; tier?: string }[];
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
  const sections = useMemo(() => groupClubsForOwnedPicker(clubs), [clubs]);
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((section) => ({
        ...section,
        clubs: section.clubs.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.slug.replace(/-/g, " ").includes(q),
        ),
      }))
      .filter((section) => section.clubs.length > 0);
  }, [sections, query]);

  return (
    <section className={styles.screen}>
      <p className={styles.pillar}>Before we start</p>
      <h2 className={styles.q}>Do you already have a club?</h2>
      <p className={styles.hint}>
        Select any you already carry. We will not match you to these.
      </p>

      <button
        type="button"
        className={`${styles.noClub} ${noClubYet ? styles.picked : ""}`}
        aria-pressed={noClubYet}
        onClick={onNoClub}
      >
        No club yet
      </button>

      <label className={styles.searchWrap}>
        <span className={styles.searchLabel}>Search clubs</span>
        <input
          type="search"
          className={styles.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Club name"
          autoComplete="off"
        />
      </label>

      <div className={styles.scroller}>
        {filteredSections.map((section) => (
          <div key={section.id} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.label}</h3>
            <div className={styles.grid}>
              {section.clubs.map((club) => {
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
            </div>
          </div>
        ))}
        {filteredSections.length === 0 ? (
          <p className={styles.empty}>No clubs match that search.</p>
        ) : null}
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
