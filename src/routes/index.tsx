import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { API_BASE_URL, type ActionEtf, fetchTopPerformers, toCsv } from "@/lib/api";
import { pct } from "@/lib/format";
import { EloqLoader } from "@/components/EloqLoader";
import { Marquee } from "@/components/Marquee";
import { PerformersTable } from "@/components/PerformersTable";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TOP 100 PERFORMERS MTD — Month-to-date market leaders" },
      {
        name: "description",
        content:
          "The 100 assets that closed the gap this month. Stocks and ETFs ranked by month-to-date performance, snapshotted daily.",
      },
      { property: "og:title", content: "TOP 100 PERFORMERS MTD" },
      {
        property: "og:description",
        content:
          "The 100 assets that closed the gap this month. Ranked stocks and ETFs, snapshotted daily.",
      },
    ],
  }),
  component: Index,
});

type TypeFilter = "ALL" | "STOCK" | "ETF";

function Index() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [sector, setSector] = useState("ALL");

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["top-performers"],
    queryFn: () => fetchTopPerformers(),
    staleTime: 60_000,
    retry: 0,
  });

  const rows = data ?? [];

  const sectors = useMemo(
    () => Array.from(new Set(rows.map((r) => r.sector).filter(Boolean) as string[])).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (typeFilter !== "ALL" && r.type !== typeFilter) return false;
      if (sector !== "ALL" && r.sector !== sector) return false;
      if (!q) return true;
      return r.symbol.toLowerCase().includes(q) || (r.name ?? "").toLowerCase().includes(q);
    });
  }, [rows, search, typeFilter, sector]);

  const marqueeItems = useMemo(() => buildMarquee(rows), [rows]);

  function exportCsv() {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `top-100-performers-mtd-${rows[0]?.snapshotDate ?? "snapshot"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-background">
      <Marquee items={marqueeItems} />

      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <span className="num text-sm font-bold tracking-tight">TOP 100 / MTD</span>
        <button
          onClick={() => refetch()}
          className="label-mono border border-border-strong px-3 py-1.5 text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {isFetching ? "Syncing" : "Refresh"}
        </button>
      </header>

      <section className="hairline-grid border-t border-border px-6 pt-16 pb-20 md:px-10 md:pt-24 md:pb-28">
        <p className="label-mono rise">Month-to-date performance index</p>
        <h1 className="display-hero rise mt-6 max-w-4xl">
          The 100 assets that
          <br />
          closed the gap
          <br />
          <span className="text-primary">this month.</span>
        </h1>
        <p className="rise mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
          One ranking, recomputed and stored once per day. Stocks and ETFs measured from the first
          trading price of the month to the latest close.
        </p>
      </section>

      <section className="border-t border-border px-6 py-6 md:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticker or name"
            className="num w-full max-w-xs border border-input bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none md:w-64"
          />

          <div className="flex border border-border-strong">
            {(["ALL", "STOCK", "ETF"] as TypeFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`label-mono px-3 py-2 transition-colors ${
                  typeFilter === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "ALL" ? "All" : t === "STOCK" ? "Stocks" : "ETFs"}
              </button>
            ))}
          </div>

          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="label-mono border border-border-strong bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          >
            <option value="ALL">All sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="label-mono ml-auto border border-primary px-4 py-2 text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
          >
            Export CSV
          </button>
        </div>
        <p className="label-mono mt-4">
          {filtered.length} of {rows.length} assets
          {rows[0]?.snapshotDate ? ` / snapshot ${rows[0].snapshotDate}` : ""}
        </p>
      </section>

      {isPending ? (
        <EloqLoader />
      ) : isError ? (
        <BackendOffline message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : (
        <PerformersTable rows={filtered} />
      )}

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-10 md:px-10">
        <span className="label-mono">Data served by the Java API — {API_BASE_URL}</span>
        <span className="label-mono">Snapshot written once per day</span>
      </footer>
    </main>
  );
}

function buildMarquee(rows: ActionEtf[]) {
  if (rows.length === 0) {
    return ["TOP 100 PERFORMERS MTD", "AWAITING BACKEND SNAPSHOT", "SOURCE: JAVA API"];
  }
  const top = rows[0];
  const avg = rows.reduce((sum, r) => sum + r.performancePct, 0) / rows.length;
  return [
    `TOP MOVER ${top.symbol} ${pct(top.performancePct)}`,
    `AVG TOP 100 ${pct(avg)}`,
    `SNAPSHOT: ${top.snapshotDate}`,
    `STOCKS ${rows.filter((r) => r.type === "STOCK").length}`,
    `ETFS ${rows.filter((r) => r.type === "ETF").length}`,
  ];
}

function BackendOffline({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="border-t border-border px-6 py-20 md:px-10">
      <p className="label-mono">Backend unreachable</p>
      <h2 className="display-section mt-4 max-w-2xl">
        The Java API is not answering on {API_BASE_URL}.
      </h2>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
        This screen never reads a database directly — every row comes from the Spring Boot service.
        Start it with <span className="num text-foreground">cd backend &amp;&amp; mvn spring-boot:run</span>,
        then retry.
      </p>
      {message ? <p className="num mt-4 text-xs text-muted-foreground">{message}</p> : null}
      <button
        onClick={onRetry}
        className="label-mono mt-8 border border-primary px-4 py-2 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        Retry
      </button>
    </div>
  );
}
