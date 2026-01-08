"use client";

import { useEffect, useState } from "react";
import { DashboardGrid } from "@/components/dashboard";
import { useDashboardStore } from "@/store";
import type { DashboardWidget, ChartData } from "@/types";

const DEMO_WIDGETS: DashboardWidget[] = [
 {
  id: "kpi-ventas",
  type: "kpi",
  title: "Ventas Totales",
  dataSource: "kpi-ventas",
  config: {},
  layout: { x: 0, y: 0, w: 3, h: 2 },
 },
 {
  id: "kpi-clientes",
  type: "kpi",
  title: "Nuevos Clientes",
  dataSource: "kpi-clientes",
  config: {},
  layout: { x: 3, y: 0, w: 3, h: 2 },
 },
 {
  id: "kpi-conversion",
  type: "kpi",
  title: "Tasa de Conversión",
  dataSource: "kpi-conversion",
  config: {},
  layout: { x: 6, y: 0, w: 3, h: 2 },
 },
 {
  id: "kpi-ticket",
  type: "kpi",
  title: "Ticket Promedio",
  dataSource: "kpi-ticket",
  config: {},
  layout: { x: 9, y: 0, w: 3, h: 2 },
 },
 {
  id: "ventas-mensuales",
  type: "bar",
  title: "Ventas por Mes",
  dataSource: "ventas-mensuales",
  config: { xAxisKey: "name", yAxisKey: "value", showLegend: false },
  layout: { x: 0, y: 2, w: 6, h: 4 },
 },
 {
  id: "tendencia",
  type: "line",
  title: "Tendencia de Ventas",
  dataSource: "tendencia",
  config: { xAxisKey: "name", yAxisKey: "value", showLegend: false },
  layout: { x: 6, y: 2, w: 6, h: 4 },
 },
 {
  id: "categorias",
  type: "pie",
  title: "Ventas por Categoría",
  dataSource: "categorias",
  config: { showLegend: true },
  layout: { x: 0, y: 6, w: 4, h: 4 },
 },
 {
  id: "evolucion",
  type: "area",
  title: "Evolución Acumulada",
  dataSource: "evolucion",
  config: { xAxisKey: "name", yAxisKey: "value", showLegend: false },
  layout: { x: 4, y: 6, w: 4, h: 4 },
 },
 {
  id: "top-productos",
  type: "table",
  title: "Top Productos",
  dataSource: "top-productos",
  config: {},
  layout: { x: 8, y: 6, w: 4, h: 4 },
 },
];

const DEMO_DATA: Record<string, ChartData[]> = {
 "kpi-ventas": [
  { name: "actual", value: 1250000 },
  { name: "anterior", value: 1100000 },
 ],
 "kpi-clientes": [
  { name: "actual", value: 847 },
  { name: "anterior", value: 792 },
 ],
 "kpi-conversion": [
  { name: "actual", value: 3.2 },
  { name: "anterior", value: 2.8 },
 ],
 "kpi-ticket": [
  { name: "actual", value: 1475 },
  { name: "anterior", value: 1389 },
 ],
 "ventas-mensuales": [
  { name: "Ene", value: 85000 },
  { name: "Feb", value: 92000 },
  { name: "Mar", value: 78000 },
  { name: "Abr", value: 110000 },
  { name: "May", value: 125000 },
  { name: "Jun", value: 98000 },
  { name: "Jul", value: 132000 },
  { name: "Ago", value: 145000 },
  { name: "Sep", value: 118000 },
  { name: "Oct", value: 156000 },
  { name: "Nov", value: 142000 },
  { name: "Dic", value: 169000 },
 ],
 tendencia: [
  { name: "Sem 1", value: 28000 },
  { name: "Sem 2", value: 32000 },
  { name: "Sem 3", value: 29000 },
  { name: "Sem 4", value: 38000 },
  { name: "Sem 5", value: 42000 },
  { name: "Sem 6", value: 35000 },
  { name: "Sem 7", value: 48000 },
  { name: "Sem 8", value: 52000 },
 ],
 categorias: [
  { name: "Electrónica", value: 35 },
  { name: "Ropa", value: 25 },
  { name: "Hogar", value: 20 },
  { name: "Deportes", value: 12 },
  { name: "Otros", value: 8 },
 ],
 evolucion: [
  { name: "Ene", value: 85000 },
  { name: "Feb", value: 177000 },
  { name: "Mar", value: 255000 },
  { name: "Abr", value: 365000 },
  { name: "May", value: 490000 },
  { name: "Jun", value: 588000 },
  { name: "Jul", value: 720000 },
  { name: "Ago", value: 865000 },
 ],
 "top-productos": [
  { name: "iPhone 15 Pro", value: 245000 },
  { name: "MacBook Air M3", value: 189000 },
  { name: "Sony WH-1000XM5", value: 78000 },
  { name: "iPad Pro 12.9", value: 156000 },
  { name: "AirPods Pro 2", value: 92000 },
  { name: "Samsung S24 Ultra", value: 134000 },
  { name: "Apple Watch S9", value: 67000 },
  { name: "Nintendo Switch", value: 54000 },
 ],
};

export default function DashboardPage() {
 const { setDashboard, isEditing, setEditing } = useDashboardStore();
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
  setMounted(true);
  setDashboard({
   name: "Dashboard de Ventas",
   description: "Panel de control de ventas y métricas",
   widgets: DEMO_WIDGETS,
   filters: [],
  });
 }, [setDashboard]);

 if (!mounted) {
  return (
   <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="text-white text-xl">Cargando dashboard...</div>
   </div>
  );
 }

 return (
  <div className="min-h-screen bg-gray-950">
   <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
    <div className="max-w-[1400px] mx-auto flex items-center justify-between">
     <div>
      <h1 className="text-2xl font-bold text-white">📊 BI Dashboard</h1>
      <p className="text-gray-400 text-sm mt-1">Dashboard de Ventas - Demo</p>
     </div>
     <div className="flex items-center gap-4">
      <button
       onClick={() => setEditing(!isEditing)}
       className={`px-4 py-2 rounded-lg font-medium transition-all ${
        isEditing
         ? "bg-indigo-600 text-white"
         : "bg-gray-800 text-gray-300 hover:bg-gray-700"
       }`}
      >
       {isEditing ? "✓ Guardar" : "✎ Editar"}
      </button>
      <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all">
       + Nuevo Widget
      </button>
     </div>
    </div>
   </header>

   <main className="max-w-[1400px] mx-auto p-6">
    {isEditing && (
     <div className="mb-4 p-3 bg-indigo-900/30 border border-indigo-700 rounded-lg text-indigo-300 text-sm">
      🔧 Modo edición activo. Arrastra los widgets para reorganizarlos.
     </div>
    )}
    <DashboardGrid widgets={DEMO_WIDGETS} data={DEMO_DATA} width={1352} />
   </main>
  </div>
 );
}
