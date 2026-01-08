"use client";

import { useMemo } from "react";
import GridLayout, { Layout } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useDashboardStore } from "@/store";
import {
 BarChartWidget,
 LineChartWidget,
 PieChartWidget,
 AreaChartWidget,
 KPIWidget,
 TableWidget,
} from "@/components/charts";
import type { DashboardWidget, ChartData } from "@/types";

interface DashboardGridProps {
 widgets: DashboardWidget[];
 data: Record<string, ChartData[]>;
 width?: number;
}

export default function DashboardGrid({
 widgets,
 data,
 width = 1200,
}: DashboardGridProps) {
 const { isEditing, updateLayout } = useDashboardStore();

 const layout = useMemo(
  () =>
   widgets.map((w) => ({
    i: w.id,
    x: w.layout.x,
    y: w.layout.y,
    w: w.layout.w,
    h: w.layout.h,
    minW: 2,
    minH: 2,
   })),
  [widgets]
 );

 const handleLayoutChange = (newLayout: Layout) => {
  if (isEditing) {
   updateLayout(
    newLayout.map((l) => ({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h }))
   );
  }
 };

 const renderWidget = (widget: DashboardWidget) => {
  const widgetData = data[widget.dataSource] || [];

  switch (widget.type) {
   case "bar":
    return (
     <BarChartWidget
      data={widgetData}
      xAxisKey={widget.config.xAxisKey}
      yAxisKey={widget.config.yAxisKey}
      colors={widget.config.colors}
      showGrid={widget.config.showGrid}
      showLegend={widget.config.showLegend}
     />
    );
   case "line":
    return (
     <LineChartWidget
      data={widgetData}
      xAxisKey={widget.config.xAxisKey}
      yAxisKey={widget.config.yAxisKey}
      colors={widget.config.colors}
      showGrid={widget.config.showGrid}
      showLegend={widget.config.showLegend}
     />
    );
   case "pie":
    return (
     <PieChartWidget
      data={widgetData}
      colors={widget.config.colors}
      showLegend={widget.config.showLegend}
     />
    );
   case "area":
    return (
     <AreaChartWidget
      data={widgetData}
      xAxisKey={widget.config.xAxisKey}
      yAxisKey={widget.config.yAxisKey}
      colors={widget.config.colors}
      showGrid={widget.config.showGrid}
      showLegend={widget.config.showLegend}
     />
    );
   case "kpi":
    return (
     <KPIWidget
      title={widget.title}
      value={widgetData[0]?.value || 0}
      previousValue={widgetData[1]?.value as number}
      format="number"
     />
    );
   case "table":
    return (
     <TableWidget
      data={widgetData}
      columns={[
       { key: "name", label: "Nombre" },
       { key: "value", label: "Valor", align: "right" },
      ]}
     />
    );
   default:
    return <div className="text-gray-400">Widget no soportado</div>;
  }
 };

 return (
  <GridLayout
   className="layout"
   layout={layout}
   cols={12}
   rowHeight={80}
   width={width}
   isDraggable={isEditing}
   isResizable={isEditing}
   onLayoutChange={handleLayoutChange}
   draggableHandle=".widget-header"
  >
   {widgets.map((widget) => (
    <div
     key={widget.id}
     className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-lg"
    >
     <div className="widget-header px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-move flex items-center justify-between">
      <h3 className="text-sm font-medium text-white">{widget.title}</h3>
      {isEditing && <span className="text-xs text-gray-500">⋮⋮</span>}
     </div>
     <div className="p-2 h-[calc(100%-40px)]">{renderWidget(widget)}</div>
    </div>
   ))}
  </GridLayout>
 );
}
