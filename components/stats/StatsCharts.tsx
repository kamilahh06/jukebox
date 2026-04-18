"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RatingDistEntry { star: string; count: number }
interface NameCountEntry  { name: string;  count: number }

interface StatsChartsProps {
  ratingDist:    RatingDistEntry[];
  topArtists:    NameCountEntry[];
  topGenres:     NameCountEntry[];
}

const CYAN    = "#5BEAD6";
const VIOLET  = "#A855F7";
const MAGENTA = "#FF2D9B";

const tooltipStyle = {
  backgroundColor: "rgba(10,10,20,0.92)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#e2e8f0",
  fontSize: 12,
};

function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{payload[0].value}</p>
    </div>
  );
}

export function RatingDistChart({ data }: { data: RatingDistEntry[] }) {
  const colors = [MAGENTA, "#f97316", CYAN, VIOLET, "#22d3ee"];
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barSize={32} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <XAxis dataKey="star" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopArtistsChart({ data }: { data: NameCountEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
      <BarChart
        data={data}
        layout="vertical"
        barSize={16}
        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
      >
        <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: "#cbd5e1", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} fill={CYAN} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopGenresChart({ data }: { data: NameCountEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
      <BarChart
        data={data}
        layout="vertical"
        barSize={16}
        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
      >
        <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fill: "#cbd5e1", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} fill={VIOLET} />
      </BarChart>
    </ResponsiveContainer>
  );
}
