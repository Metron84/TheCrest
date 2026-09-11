"use client";

import styles from "./ProgressRail.module.css";

/** @param {{ activeIndex: number; total?: number }} props */
export default function ProgressRail({ activeIndex, total = 12 }) {
  return (
    <div className={styles.rail} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        let className = styles.tick;
        if (i < activeIndex) className += ` ${styles.done}`;
        else if (i === activeIndex) className += ` ${styles.now}`;
        return <span key={i} className={className} />;
      })}
    </div>
  );
}
