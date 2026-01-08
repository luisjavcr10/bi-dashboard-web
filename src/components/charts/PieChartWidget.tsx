"use client";

import {
 PieChart,
 Pie,
 Cell,
 Tooltip,
 Legend,
 ResponsiveContainer,
} from "recharts";
import type { ChartData } from "@/types";

interface PieChartWidgetProps {
 data: ChartData[];
 colors?: string[];
 showLegend?: boolean;
 innerRadius?: number;
}

const DEFAULT_COLORS = [
 "#6366f1",
 "#8b5cf6",
 "#a855f7",
 "#d946ef",
 "#ec4899",
 "#f43f5e",
];

export default function PieChartWidget({
 data,
 colors = DEFAULT_COLORS,
 showLegend = true,
 innerRadius = 0,
}: PieChartWidgetProps) {
 return (
  <ResponsiveContainer width="100%" height="100%">
   <PieChart>
    <Pie
     data={data}
     cx="50%"
     cy="50%"
     innerRadius={innerRadius}
     outerRadius="80%"
     paddingAngle={2}
     dataKey="value"
     nameKey="name"
     label={({ name, percent }) =>
      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
     }
     labelLine={{ stroke: "#9ca3af" }}
    >
     {data.map((_, index) => (
      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
     ))}
    </Pie>
    <Tooltip
     contentStyle={{
      backgroundColor: "#1f2937",
      border: "1px solid #374151",
      borderRadius: "8px",
      color: "#fff",
     }}
    />
    {showLegend && <Legend />}
   </PieChart>
  </ResponsiveContainer>
 );
}
