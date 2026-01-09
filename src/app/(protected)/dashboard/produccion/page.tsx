"use client";

import { useEffect, useState } from "react";
import { FilterProvider, FilterBar, useFilters } from "@/components/filters";
import {
 BarChartWidget,
 LineChartWidget,
 PieChartWidget,
 KPIWidget,
 TableWidget,
} from "@/components/charts";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { HiChartBar, HiExclamationCircle } from "react-icons/hi2";
import EmptyState from "@/components/ui/EmptyState";
import { useAgentStore } from "@/store/agentStore";
import ExpandableCard from "@/components/ui/ExpandableCard";

interface DashboardData {
 kpis: {
  produccionTotal: number;
  mermaTotal: number;
  porcentajeMerma: number;
  totalMallas: number;
  rendimientoPromedio: number;
 };
 charts: {
  produccionPorEspecie: {
   name: string;
   value: number;
   merma: number;
   rendimiento: number;
  }[];
  mermaPorTipo: { name: string; value: number }[];
  tendenciaMerma: { name: string; value: number; porcentaje: number }[];
 };
 tables: {
  topProductosMerma: {
   Producto: string;
   Especie: string;
   PesoMerma: number;
   PorcentajeMerma: number;
  }[];
 };
}

function DashboardContent() {
 const { getQueryParams, filters } = useFilters();
 const [data, setData] = useState<DashboardData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  const fetchData = async () => {
   setLoading(true);
   try {
    const queryParams = getQueryParams();
    const url = `/api/dashboard/produccion${
     queryParams ? `?${queryParams}` : ""
    }`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.status === "ok") {
     setData(json.data);
     setError(null);
     useAgentStore.getState().setDashboardContext("Producción", json.data);
    } else {
     setError(json.message);
    }
   } catch {
    setError("Error al cargar datos");
   } finally {
    setLoading(false);
   }
  };

  fetchData();
 }, [filters, getQueryParams]);

 if (loading) {
  return <EmptyState isLoading={true} />;
 }

 if (error) {
  return (
   <EmptyState
    title="Error al cargar datos"
    message={error}
    icon={HiExclamationCircle}
   />
  );
 }

 if (!data) {
  return <EmptyState />;
 }

 return (
  <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-5 lg:grid-rows-2 gap-4">
   {/* Column 1: Stacked KPIs (4 items) */}
   <div className="md:col-span-1 lg:row-span-2 flex flex-col gap-4 min-h-0">
    <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl flex flex-col justify-center shadow-lg shadow-gray-950/50 p-2 min-h-[100px]">
     <KPIWidget
      title="Producción Total"
      value={data.kpis.produccionTotal}
      format="number"
      suffix=" kg"
      compact
     />
    </div>
    <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl flex flex-col justify-center shadow-lg shadow-gray-950/50 p-2 min-h-[100px]">
     <KPIWidget
      title="Merma Total"
      value={data.kpis.mermaTotal}
      format="number"
      suffix=" kg"
      compact
     />
    </div>
    <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl flex flex-col justify-center shadow-lg shadow-gray-950/50 p-2 min-h-[100px]">
     <KPIWidget
      title="% Merma"
      value={data.kpis.porcentajeMerma}
      format="percent"
      compact
     />
    </div>
    <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl flex flex-col justify-center shadow-lg shadow-gray-950/50 p-2 min-h-[100px]">
     <KPIWidget
      title="Total Mallas"
      value={data.kpis.totalMallas}
      format="number"
      compact
     />
    </div>
    <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl flex flex-col justify-center shadow-lg shadow-gray-950/50 p-2 min-h-[100px]">
     <KPIWidget
      title="Rendimiento"
      value={data.kpis.rendimientoPromedio}
      format="percent"
      compact
     />
    </div>
   </div>

   {/* Grid: 2x2 Charts */}
   {/* Top Left */}
   <ExpandableCard
    title="Producción por Especie"
    className="md:col-span-2 min-h-[300px] lg:min-h-0"
   >
    <BarChartWidget
     data={data.charts.produccionPorEspecie}
     xAxisKey="name"
     yAxisKey="value"
     showLegend={false}
    />
   </ExpandableCard>

   {/* Top Right */}
   <ExpandableCard
    title="Tendencia de Merma"
    className="md:col-span-2 min-h-[300px] lg:min-h-0"
   >
    <LineChartWidget
     data={data.charts.tendenciaMerma}
     xAxisKey="name"
     yAxisKey="value"
     showLegend={false}
    />
   </ExpandableCard>

   {/* Bottom Left */}
   <ExpandableCard
    title="Merma por Tipo"
    className="md:col-span-2 min-h-[300px] lg:min-h-0"
   >
    <PieChartWidget data={data.charts.mermaPorTipo} showLegend />
   </ExpandableCard>

   {/* Bottom Right */}
   <ExpandableCard
    title="Top Productos con Merma"
    className="md:col-span-2 min-h-[300px] lg:min-h-0"
   >
    <TableWidget
     data={data.tables.topProductosMerma}
     columns={[
      { key: "Producto", label: "Producto" },
      { key: "Especie", label: "Especie" },
      { key: "PesoMerma", label: "Merma", align: "right" },
      { key: "PorcentajeMerma", label: "%", align: "right" },
     ]}
    />
   </ExpandableCard>
  </div>
 );
}

export default function ProduccionDashboard() {
 return (
  <FilterProvider>
   <div className="h-full flex flex-col p-3 lg:p-6 gap-4 overflow-y-auto lg:overflow-hidden">
    <div className="flex-none flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
     <DashboardHeader title="Dashboard de Producción" icon={HiChartBar} />
     <FilterBar showYear showMonth showDay showTurno />
    </div>
    <DashboardContent />
   </div>
  </FilterProvider>
 );
}
