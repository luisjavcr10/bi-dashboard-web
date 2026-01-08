"use client";

import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
} from "recharts";
import type { ChartData } from "@/types";

interface LineChartWidgetProps {
 data: ChartData[];
 xAxisKey?: string;
 yAxisKey?: string;
 colors?: string[];
 showGrid?: boolean;
 showLegend?: boolean;
}

const DEFAULT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function LineChartWidget({
 data,
 xAxisKey = "name",
 yAxisKey = "value",
 colors = DEFAULT_COLORS,
 showGrid = true,
 showLegend = true,
}: LineChartWidgetProps) {
 return (
  <ResponsiveContainer width="100%" height="100%">
   <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
    <Line
     type="monotone"
     dataKey={yAxisKey}
     stroke={colors[0]}
     strokeWidth={2}
     dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
     activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
    />
   </LineChart>
  </ResponsiveContainer>
 );
}
