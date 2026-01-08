"use client";

import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
} from "recharts";
import type { ChartData } from "@/types";

interface BarChartWidgetProps {
 data: ChartData[];
 xAxisKey?: string;
 yAxisKey?: string;
 colors?: string[];
 showGrid?: boolean;
 showLegend?: boolean;
}

const DEFAULT_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef"];

export default function BarChartWidget({
 data,
 xAxisKey = "name",
 yAxisKey = "value",
 colors = DEFAULT_COLORS,
 showGrid = true,
 showLegend = true,
}: BarChartWidgetProps) {
 return (
  <ResponsiveContainer width="100%" height="100%">
   <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
    <Bar dataKey={yAxisKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
   </BarChart>
  </ResponsiveContainer>
 );
}
