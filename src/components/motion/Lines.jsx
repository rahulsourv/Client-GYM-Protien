/** Renders each line inside a mask so it can rise into view (data-reveal="lines"). */
export default function Lines({ lines, as: Tag = "span", className = "", lineClassName = "", reveal = true, delay, ...rest }) {
  return (
    <Tag className={className} data-reveal={reveal ? "lines" : undefined} data-reveal-delay={delay} {...rest}>
      {lines.map((l, i) => (
        <span key={i} className="line-mask">
          <span className={lineClassName}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}
