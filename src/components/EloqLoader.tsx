export function EloqLoader({ label = "Loading snapshot" }: { label?: string }) {
  return (
    <div className="flex min-h-[55vh] flex-col justify-center border-t border-border px-6 md:px-10">
      <p className="label-mono">{label}</p>
      <h2 className="display-section mt-4 max-w-2xl">
        Reading the market. Building today&apos;s snapshot.
      </h2>
      <div className="loader-sweep mt-10 h-px w-full bg-border" />
      <div className="mt-10 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 opacity-[calc(1-0.09*var(--i))]" style={{ ["--i" as string]: i }}>
            <div className="h-3 w-8 bg-muted" />
            <div className="h-3 w-24 bg-muted" />
            <div className="h-3 flex-1 bg-muted" />
            <div className="h-3 w-16 bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
