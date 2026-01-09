"use client";

import { useEffect, useState } from "react";
import { FilterProvider, FilterBar, useFilters } from "@/components/filters";
import {
 BarChartWidget,
 KPIWidget,
 GaugeWidget,
 HorizontalBarChart,
 AreaChartWidget,
} from "@/components/charts";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { HiClock, HiExclamationCircle } from "react-icons/hi2";
import EmptyState from "@/components/ui/EmptyState";

interface DashboardData {
 kpis: {
  disponibilidad: number;
  totalParadas: number;
  tiempoPerdido: number;
  mtbf: number;
  mttr: number;
 };
 charts: {
  paradasPorCausa: {
   name: string;
   value: number;
   cantidad: number;
   porcentaje: number;
  }[];
  tendenciaParadas: { name: string; value: number; cantidad: number }[];
  paradasPorEtapa: {
   name: string;
   tipo: string;
   value: number;
   cantidad: number;
  }[];
  paradasPorTurno: { name: string; value: number; disponibilidad: number }[];
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
    const url = `/api/dashboard/paradas${queryParams ? `?${queryParams}` : ""}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.status === "ok") {
     setData(json.data);
     setError(null);
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
   {/* Column 1: Stacked KPIs (Takes 1 column, spans all rows) */}
   <div className="md:col-span-1 lg:row-span-2 flex flex-col gap-4 min-h-0">
    <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl flex flex-col justify-center shadow-lg shadow-gray-950/50 p-2 min-h-[120px]">
     <GaugeWidget
      title="Disponibilidad"
      value={data.kpis.disponibilidad}
      maxValue={100}
      suffix="%"
      thresholds={{ warning: 85, danger: 70 }}
     />
    </div>
    <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl flex flex-col justify-center shadow-lg shadow-gray-950/50 p-2 min-h-[120px]">
     <div className="flex flex-col gap-2 p-2">
      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
       <span className="text-[10px] text-gray-400 uppercase tracking-wide">
        Total Paradas
       </span>
       <span className="text-sm font-bold text-white">
        {new Intl.NumberFormat("es-MX").format(data.kpis.totalParadas)}
       </span>
      </div>
      <div className="flex justify-between items-center pt-1">
       <span className="text-[10px] text-gray-400 uppercase tracking-wide">
        Tiempo Perdido
       </span>
       <span className="text-sm font-bold text-white">
        {new Intl.NumberFormat("es-MX").format(data.kpis.tiempoPerdido)} min
       </span>
      </div>
     </div>
    </div>
    <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl flex flex-col justify-center shadow-lg shadow-gray-950/50 p-2 min-h-[120px]">
     <KPIWidget
      title="MTBF"
      value={data.kpis.mtbf}
      format="number"
      suffix=" h"
     />
    </div>
    <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl flex flex-col justify-center shadow-lg shadow-gray-950/50 p-2 min-h-[120px]">
     <KPIWidget
      title="MTTR"
      value={data.kpis.mttr}
      format="number"
      suffix=" h"
     />
    </div>
   </div>

   {/* Columns 2-5: Chart Grid (2x2) */}

   {/* Top Left Chart */}
   <div className="md:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col min-h-[300px] lg:min-h-0 shadow-lg shadow-gray-950/50">
    <h3 className="text-white font-medium mb-4 shrink-0">Paradas por Causa</h3>
    <div className="flex-1 min-h-0">
     <HorizontalBarChart data={data.charts.paradasPorCausa} valueKey="value" />
    </div>
   </div>

   {/* Top Right Chart */}
   <div className="md:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col min-h-[300px] lg:min-h-0 shadow-lg shadow-gray-950/50">
    <h3 className="text-white font-medium mb-4 shrink-0">
     Tendencia de Paradas
    </h3>
    <div className="flex-1 min-h-0">
     <AreaChartWidget
      data={data.charts.tendenciaParadas}
      xAxisKey="name"
      yAxisKey="value"
      showLegend={false}
     />
    </div>
   </div>

   {/* Bottom Left Chart */}
   <div className="md:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col min-h-[300px] lg:min-h-0 shadow-lg shadow-gray-950/50">
    <h3 className="text-white font-medium mb-4 shrink-0">Paradas por Etapa</h3>
    <div className="flex-1 min-h-0">
     <BarChartWidget
      data={data.charts.paradasPorEtapa}
      xAxisKey="name"
      yAxisKey="value"
      showLegend={false}
     />
    </div>
   </div>

   {/* Bottom Right Chart */}
   <div className="md:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col min-h-[300px] lg:min-h-0 shadow-lg shadow-gray-950/50">
    <h3 className="text-white font-medium mb-4 shrink-0">
     Disponibilidad por Turno
    </h3>
    <div className="flex-1 min-h-0">
     <BarChartWidget
      data={data.charts.paradasPorTurno.map((t) => ({
       name: t.name,
       value: t.disponibilidad,
      }))}
      xAxisKey="name"
      yAxisKey="value"
      showLegend={false}
      colors={["#10b981"]}
     />
    </div>
   </div>
  </div>
 );
}

export default function ParadasDashboard() {
 return (
  <FilterProvider>
   <div className="h-full flex flex-col p-3 lg:p-6 gap-4 overflow-y-auto lg:overflow-hidden">
    <div className="flex-none flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
     <DashboardHeader title="Dashboard de Paradas" icon={HiClock} />
     <FilterBar showYear showMonth showDay />
    </div>
    <DashboardContent />
   </div>
  </FilterProvider>
 );
}
