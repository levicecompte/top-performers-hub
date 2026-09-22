import { type ActionEtf, sparklineSeries } from "@/lib/api";
import { compact, money, pct } from "@/lib/format";
import { Sparkline } from "@/components/Sparkline";

const HEAD = [
  "Rank",
  "Ticker",
  "Name",
  "Type",
  "Price Now",
  "Price 1st",
  "Perf % MTD",
  "Trend",
  "Cap",
  "Volume",
];

export function PerformersTable({ rows }: { rows: ActionEtf[] }) {
  if (rows.length === 0) {
    return (
      <div className="border-t border-border py-20 text-center">
        <p className="label-mono">No match</p>
        <p className="mt-3 text-lg text-muted-foreground">
          Nothing in this snapshot fits the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-t border-border">
      <table className="w-full min-w-[1000px] border-collapse">
        <thead>
          <tr className="border-b border-border-strong">
            {HEAD.map((h, i) => (
              <th
                key={h}
                className={`label-mono px-4 py-4 whitespace-nowrap ${
                  i > 3 ? "text-right" : "text-left"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const up = row.performancePct >= 0;
            return (
              <tr
                key={`${row.snapshotDate}-${row.symbol}`}
                className="border-b border-border transition-colors hover:bg-surface"
              >
                <td className="num px-4 py-3 text-sm text-muted-foreground">
                  {String(row.rank).padStart(3, "0")}
                </td>
                <td className="px-4 py-3">
                  <span className="num text-sm font-bold tracking-tight">{row.symbol}</span>
                </td>
                <td className="max-w-[260px] truncate px-4 py-3 text-sm text-muted-foreground">
                  {row.name}
                  {row.sector ? (
                    <span className="label-mono ml-2 hidden xl:inline">{row.sector}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`label-mono border px-2 py-0.5 ${
                      row.type === "ETF"
                        ? "border-border-strong text-foreground"
                        : "border-primary text-primary"
                    }`}
                  >
                    {row.type}
                  </span>
                </td>
                <td className="num px-4 py-3 text-right text-sm">{money(row.priceNow)}</td>
                <td className="num px-4 py-3 text-right text-sm text-muted-foreground">
                  {money(row.priceMonthStart)}
                </td>
                <td
                  className={`num px-4 py-3 text-right text-sm font-bold ${
                    up ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {pct(row.performancePct)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Sparkline data={sparklineSeries(row)} positive={up} />
                  </div>
                </td>
                <td className="num px-4 py-3 text-right text-sm text-muted-foreground">
                  {compact(row.marketCap)}
                </td>
                <td className="num px-4 py-3 text-right text-sm text-muted-foreground">
                  {compact(row.volume)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
