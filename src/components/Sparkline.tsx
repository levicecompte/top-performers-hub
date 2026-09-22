import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

type SparklineProps = {
  data: { i: number; v: number }[];
  positive: boolean;
};

export function Sparkline({ data, positive }: SparklineProps) {
  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line
            type="monotone"
            dataKey="v"
            stroke={positive ? "var(--color-primary)" : "var(--color-muted-foreground)"}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
