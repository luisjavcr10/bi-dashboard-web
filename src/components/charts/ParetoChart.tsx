"use client";

import {
 ComposedChart,
 Bar,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Cell,
} from "recharts";
import type { ChartData } from "@/types";

interface ParetoChartProps {
 data: ChartData[];
 valueKey?: string;
 barColor?: string;
 lineColor?: string;
 showGrid?: boolean;
}

export default function ParetoChart({
 data,
 valueKey = "value",
 barColor = "#6366f1",
 lineColor = "#10b981",
 showGrid = true,
}: ParetoChartProps) {
 const total = data.reduce((sum, item) => sum + (item[valueKey] as number), 0);

 let cumulative = 0;
 const paretoData = data.map((item) => {
  cumulative += item[valueKey] as number;
  return {
   ...item,
   cumulative: total > 0 ? (cumulative / total) * 100 : 0,
  };
 });

 return (
  <ResponsiveContainer width="100%" height="100%">
   <ComposedChart
    data={paretoData}
    margin={{ top: 20, right: 50, left: 20, bottom: 60 }}
   >
    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
    <XAxis
     dataKey="name"
     stroke="#9ca3af"
     fontSize={10}
     angle={-45}
     textAnchor="end"
     height={60}
    />
    <YAxis yAxisId="left" stroke="#9ca3af" fontSize={11} />
    <YAxis
     yAxisId="right"
     orientation="right"
     stroke={lineColor}
     fontSize={11}
     domain={[0, 100]}
     tickFormatter={(value) => `${value}%`}
    />
    <Tooltip
     contentStyle={{
      backgroundColor: "#1f2937",
      border: "1px solid #374151",
      borderRadius: "8px",
      color: "#fff",
     }}
     formatter={(value: number | undefined, name: string | undefined) => {
      if (name === "cumulative")
       return [`${(value ?? 0).toFixed(1)}%`, "Acumulado"];
      return [(value ?? 0).toLocaleString(), "Valor"];
     }}
    />
    <Bar yAxisId="left" dataKey={valueKey} radius={[4, 4, 0, 0]}>
     {paretoData.map((entry, index) => (
      <Cell
       key={`cell-${index}`}
       fill={entry.cumulative <= 80 ? barColor : "#4b5563"}
      />
     ))}
    </Bar>
    <Line
     yAxisId="right"
     type="monotone"
     dataKey="cumulative"
     stroke={lineColor}
     strokeWidth={2}
     dot={{ fill: lineColor, strokeWidth: 2, r: 3 }}
    />
   </ComposedChart>
  </ResponsiveContainer>
 );
}
