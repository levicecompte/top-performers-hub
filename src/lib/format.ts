export function money(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function pct(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

export function compact(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (const [size, suffix] of units) {
    if (Math.abs(v) >= size) return `${(v / size).toFixed(v / size >= 100 ? 0 : 1)}${suffix}`;
  }
  return String(v);
}
