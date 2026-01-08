"use client";

import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
} from "recharts";
import type { ChartData } from "@/types";

interface AreaChartWidgetProps {
 data: ChartData[];
 xAxisKey?: string;
 yAxisKey?: string;
 colors?: string[];
 showGrid?: boolean;
 showLegend?: boolean;
}

const DEFAULT_COLORS = ["#6366f1"];

export default function AreaChartWidget({
 data,
 xAxisKey = "name",
 yAxisKey = "value",
 colors = DEFAULT_COLORS,
 showGrid = true,
 showLegend = true,
}: AreaChartWidgetProps) {
 return (
  <ResponsiveContainer width="100%" height="100%">
   <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
    <defs>
     <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
      <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1} />
     </linearGradient>
    </defs>
    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
    <XAxis dataKey={xAxisKey} stroke="#9ca3af" fontSize={12} />
    <YAxis stroke="#9ca3af" fontSize={12} />
    <Tooltip
     contentStyle={{
      backgroundColor: "#1f2937",
      border: "1px solid #374151",
      borderRadius: "8px",
      color: "#fff",
     }}
    />
    {showLegend && <Legend />}
    <Area
     type="monotone"
     dataKey={yAxisKey}
     stroke={colors[0]}
     fillOpacity={1}
     fill="url(#colorValue)"
    />
   </AreaChart>
  </ResponsiveContainer>
 );
}
