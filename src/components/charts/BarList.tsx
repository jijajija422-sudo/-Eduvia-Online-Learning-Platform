interface BarItem {
  label: string;
  value: number;
}

export function BarList({ items, color = "#3b82f6" }: { items: BarItem[]; color?: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="truncate pr-2 text-foreground">{item.label}</span>
            <span className="text-muted-foreground font-medium">{item.value}</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({
  data,
  color = "#3b82f6",
  height = 48,
}: {
  data: { date: string; count: number }[];
  color?: string;
  height?: number;
}) {
  if (data.length === 0) return <div className="text-xs text-muted-foreground">No data</div>;
  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 300;
  const h = height;
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const points = data
    .map((d, i) => `${(i * step).toFixed(1)},${(h - (d.count / max) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}
