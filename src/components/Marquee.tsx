type MarqueeProps = {
  items: string[];
};

export function Marquee({ items }: MarqueeProps) {
  const sequence = [...items, ...items, ...items, ...items];

  return (
    <div className="overflow-hidden border-b border-border bg-background py-3">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {sequence.map((item, i) => (
              <span key={`${copy}-${i}`} className="flex items-center">
                <span className="px-4 font-mono text-xs tracking-[0.18em] text-primary">/</span>
                <span className="font-mono text-xs tracking-[0.18em] text-foreground uppercase">
                  {item}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
