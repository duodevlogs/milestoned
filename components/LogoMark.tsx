/*
 * The Milestoned logo mark (gold-bordered document tile). Sized via a prop
 * with proportional inner geometry, so the positions stay computed inline —
 * Tailwind utilities can't express prop-driven pixel math.
 */
export function LogoMark({ size = 26 }: { size?: number }) {
  const s = size / 26;
  return (
    <div
      className="relative shrink-0 border-gold"
      style={{
        width: size,
        height: size,
        borderWidth: 1.5 * s,
        borderStyle: "solid",
        borderRadius: 6 * s,
      }}
    >
      <div
        className="absolute rounded-full bg-gold"
        style={{ left: 5 * s, top: 5 * s, width: 6 * s, height: 6 * s }}
      />
      <div
        className="absolute bg-[rgba(230,237,243,0.5)]"
        style={{ left: 5 * s, top: 12.5 * s, width: 11 * s, height: 1.5 * s }}
      />
      <div
        className="absolute bg-[rgba(230,237,243,0.5)]"
        style={{ left: 5 * s, top: 16.5 * s, width: 8 * s, height: 1.5 * s }}
      />
    </div>
  );
}
