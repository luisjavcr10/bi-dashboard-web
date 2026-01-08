"use client";

import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Cell,
} from "recharts";
import type { ChartData } from "@/types";

interface HorizontalBarChartProps {
 data: ChartData[];
 valueKey?: string;
 colors?: string[];
 showGrid?: boolean;
 maxBars?: number;
}

const DEFAULT_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];

export default function HorizontalBarChart({
 data,
 valueKey = "value",
 colors = DEFAULT_COLORS,
 showGrid = true,
 maxBars = 10,
}: HorizontalBarChartProps) {
 const displayData = data.slice(0, maxBars);

 return (
  <ResponsiveContainer width="100%" height="100%">
   <BarChart
    data={displayData}
    layout="vertical"
    margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
   >
    {showGrid && (
     <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
    )}
    <XAxis type="number" stroke="#9ca3af" fontSize={11} />
    <YAxis
     type="category"
     dataKey="name"
     stroke="#9ca3af"
     fontSize={11}
     width={90}
     tickLine={false}
    />
    <Tooltip
     contentStyle={{
      backgroundColor: "#1f2937",
      border: "1px solid #374151",
      borderRadius: "8px",
      color: "#fff",
     }}
     formatter={(value: number | undefined) => [
      value?.toLocaleString() ?? "0",
      "Valor",
     ]}
    />
    <Bar dataKey={valueKey} radius={[0, 4, 4, 0]}>
     {displayData.map((_, index) => (
      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
     ))}
    </Bar>
   </BarChart>
  </ResponsiveContainer>
 );
}
