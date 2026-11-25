/** Visible marker for content that the store owner still has to confirm. */
export default function Placeholder({ children = "To be confirmed", className = "" }) {
  return (
    <span className={`placeholder-tag ${className}`} title="Placeholder — update in src/data/catalog.js or the page source">
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
