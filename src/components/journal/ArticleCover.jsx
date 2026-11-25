/** Typographic cover — no stock photography. */
const tones = {
  dark: "bg-graphite text-warm",
  light: "bg-soft text-obsidian",
  ink: "bg-obsidian text-warm [&>span:first-child]:text-transparent [&>span:first-child]:[-webkit-text-stroke:2px_#f3f2ed]",
};

export default function ArticleCover({ article, className = "", big = false }) {
  return (
    <div className={`relative overflow-hidden ${tones[article.tone]} ${className}`}>
      <span
        aria-hidden
        className={`display absolute -bottom-[0.12em] -left-[0.04em] whitespace-nowrap leading-none transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:-translate-y-3 ${
          big ? "text-[26vw] md:text-[17vw]" : "text-[26vw] md:text-[9vw]"
        }`}
      >
        {article.cover}
      </span>
      <span className="eyebrow absolute left-4 top-4 opacity-70">{article.category}</span>
      <span className="eyebrow absolute right-4 top-4 opacity-70">{article.readTime}</span>
    </div>
  );
}
