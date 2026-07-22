export function CreditsRing({ left, total }: { left: number; total: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const frac = total > 0 ? left / total : 0;
  const filled = Math.max(0, Math.min(1, frac)) * circ;

  return (
    <svg width="66" height="66" viewBox="0 0 66 66" className="-rotate-90">
      <circle cx="33" cy="33" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle
        cx="33"
        cy="33"
        r={r}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${filled.toFixed(1)} ${circ.toFixed(1)}`}
        className="stroke-gold"
      />
    </svg>
  );
}
