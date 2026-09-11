/**
 * Twelve spoke identity crest from the user vector.
 * @param {{ scores: number[]; className?: string }} props
 */
export default function Crest({ scores, className }) {
  const cx = 140;
  const cy = 140;
  const rMin = 26;
  const rMax = 118;

  const pts = scores.map((s, i) => {
    const ang = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    const r = rMin + ((s - 1) / 6) * (rMax - rMin);
    return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
  });

  const pathD =
    pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") +
    " Z";

  return (
    <div className={className}>
      <svg
        viewBox="0 0 280 280"
        role="img"
        aria-label="Your football identity crest"
        className="crest-svg"
      >
        <circle cx={cx} cy={cy} r={rMax} fill="none" stroke="#DED3C2" />
        <circle
          cx={cx}
          cy={cy}
          r={(rMax + rMin) / 2}
          fill="none"
          stroke="#DED3C2"
        />
        {pts.map((p, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p[0]}
            y2={p[1]}
            stroke="#0A111F"
            strokeOpacity={0.18}
            strokeWidth={1}
          />
        ))}
        <path d={pathD} fill="#0A111F" fillOpacity="0.9" />
        <circle cx={cx} cy={cy} r={4} fill="#D8232A" />
      </svg>
    </div>
  );
}
