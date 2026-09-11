"use client";

import styles from "./ProgressRail.module.css";

/** @param {{ activeIndex: number; total?: number }} props */
export default function ProgressRail({ activeIndex, total = 12 }) {
  const step = Math.min(activeIndex + 1, total);
  const label =
    activeIndex >= total
      ? `${total} of ${total}`
      : `${step} of ${total}`;

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>{label}</p>
      <div className={styles.rail} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => {
          let className = styles.tick;
          if (i < activeIndex) className += ` ${styles.done}`;
          else if (i === activeIndex && activeIndex < total) className += ` ${styles.now}`;
          return <span key={i} className={className} />;
        })}
      </div>
    </div>
  );
}
