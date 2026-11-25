/**
 * Typographic wordmark echoing the HV Nutrition logo (slanted HV over NUTRITION).
 * The original raster logo is at /public/brand/logo-hv.png (white background).
 */
export default function Wordmark({ className = "", compact = false }) {
  return (
    <span className={`inline-flex items-baseline gap-2 leading-none select-none ${className}`} aria-label="HV Nutrition">
      <span
        aria-hidden
        className="-mr-[0.12em] bg-clip-text pr-[0.12em] font-display text-[1.65em] font-black italic tracking-[-0.06em] text-transparent"
        style={{ fontVariationSettings: '"wdth" 100', backgroundImage: "linear-gradient(180deg, #ffcc00 0%, #ffb000 55%, #ff9f00 100%)" }}
      >
        HV
      </span>
      {!compact && (
        <span aria-hidden className="font-display text-[0.72em] font-bold tracking-[0.28em]" style={{ fontVariationSettings: '"wdth" 112' }}>
          NUTRITION
        </span>
      )}
    </span>
  );
}
