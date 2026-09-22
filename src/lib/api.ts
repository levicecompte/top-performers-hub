export type ActionEtf = {
  id: number;
  snapshotDate: string;
  rank: number;
  symbol: string;
  name: string;
  type: "STOCK" | "ETF" | string;
  priceNow: number;
  priceMonthStart: number;
  performancePct: number;
  marketCap: number | null;
  volume: number | null;
  sector: string | null;
  createdAt?: string;
};

/** The frontend only ever talks to the Java backend, never to a database. */
export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:8080";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Backend responded ${res.status}`);
  return (await res.json()) as T;
}

export function fetchTopPerformers(date?: string) {
  return getJson<ActionEtf[]>(`/api/top-performers${date ? `?date=${date}` : ""}`);
}

export function fetchSymbolHistory(symbol: string) {
  return getJson<ActionEtf[]>(`/api/top-performers/history?symbol=${encodeURIComponent(symbol)}`);
}

export async function forceSnapshot() {
  const res = await fetch(`${API_BASE_URL}/api/snapshot/force`, { method: "POST" });
  if (!res.ok) throw new Error(`Backend responded ${res.status}`);
  return (await res.json()) as ActionEtf[];
}

export function fetchHealth() {
  return getJson<Record<string, unknown>>("/api/health");
}

/** Deterministic intraperiod path between month start and now — used for sparklines. */
export function sparklineSeries(row: ActionEtf, points = 22) {
  let seed = 0;
  for (let i = 0; i < row.symbol.length; i++) seed = (seed * 31 + row.symbol.charCodeAt(i)) % 100000;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const start = row.priceMonthStart;
  const end = row.priceNow;
  const out: { i: number; v: number }[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const drift = start + (end - start) * t;
    const noise = i === 0 || i === points - 1 ? 0 : (rand() - 0.5) * Math.abs(end - start) * 0.42;
    out.push({ i, v: Number((drift + noise).toFixed(4)) });
  }
  return out;
}

export function toCsv(rows: ActionEtf[]) {
  const head = [
    "rank",
    "symbol",
    "name",
    "type",
    "price_now",
    "price_month_start",
    "performance_pct",
    "market_cap",
    "volume",
    "sector",
    "snapshot_date",
  ];
  const body = rows.map((r) =>
    [
      r.rank,
      r.symbol,
      `"${(r.name ?? "").replace(/"/g, '""')}"`,
      r.type,
      r.priceNow,
      r.priceMonthStart,
      r.performancePct,
      r.marketCap ?? "",
      r.volume ?? "",
      r.sector ?? "",
      r.snapshotDate,
    ].join(","),
  );
  return [head.join(","), ...body].join("\n");
}
