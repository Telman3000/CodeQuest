export type RadarMetric = { label: string; value: number };

type Props = {
  metrics: RadarMetric[];
  title?: string;
};

/**
 * Lightweight SVG radar (no chart deps). Values are 0–100 per axis.
 */
export function PerformanceRadar({ metrics, title = "Performance radar" }: Props) {
  const n = Math.max(1, metrics.length);
  const cx = 100;
  const cy = 100;
  const maxR = 68;
  const labelR = 88;

  const angleAt = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;

  const point = (i: number, radius: number) => {
    const a = angleAt(i);
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)] as const;
  };

  const gridRings = [0.25, 0.5, 0.75, 1].map((t) => maxR * t);

  const dataPoints = metrics.map((m, i) => {
    const r = (Math.min(100, Math.max(0, m.value)) / 100) * maxR;
    const [x, y] = point(i, r);
    return `${x},${y}`;
  });

  return (
    <div className="performance-radar">
      <h3 className="performance-radar-title">{title}</h3>
      <svg viewBox="0 0 200 200" className="performance-radar-svg" role="img" aria-label={title}>
        <title>{title}</title>
        {gridRings.map((rr) => (
          <polygon
            key={rr}
            className="performance-radar-grid"
            points={metrics
              .map((_, i) => {
                const [x, y] = point(i, rr);
                return `${x},${y}`;
              })
              .join(" ")}
          />
        ))}
        {metrics.map((_, i) => {
          const [ax, ay] = point(i, maxR);
          return (
            <line
              key={`axis-${i}`}
              className="performance-radar-axis"
              x1={cx}
              y1={cy}
              x2={ax}
              y2={ay}
            />
          );
        })}
        <polygon
          className="performance-radar-fill"
          points={dataPoints.join(" ")}
        />
        <polygon
          className="performance-radar-stroke"
          fill="none"
          points={dataPoints.join(" ")}
        />
        {metrics.map((m, i) => {
          const [lx, ly] = point(i, labelR);
          return (
            <text
              key={m.label}
              className="performance-radar-label"
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {m.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
