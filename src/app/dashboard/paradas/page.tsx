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
import Link from "next/link";

interface DashboardData {
 kpis: {
  disponibilidad: number;
  totalParadas: number;
  tiempoPerdido: number;
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
  return (
   <div className="flex items-center justify-center h-64">
    <div className="text-gray-400">Cargando datos...</div>
   </div>
  );
 }

 if (error || !data) {
  return (
   <div className="flex items-center justify-center h-64">
    <div className="text-red-400">{error || "Sin datos"}</div>
   </div>
  );
 }

 return (
  <div className="space-y-6">
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <GaugeWidget
      title="Disponibilidad"
      value={data.kpis.disponibilidad}
      maxValue={100}
      suffix="%"
      thresholds={{ warning: 85, danger: 70 }}
     />
    </div>
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <KPIWidget
      title="Total Paradas"
      value={data.kpis.totalParadas}
      format="number"
     />
    </div>
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <KPIWidget
      title="Tiempo Perdido"
      value={data.kpis.tiempoPerdido}
      format="number"
      suffix=" min"
     />
    </div>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <h3 className="text-white font-medium mb-4">Paradas por Causa</h3>
     <div className="h-80">
      <HorizontalBarChart data={data.charts.paradasPorCausa} valueKey="value" />
     </div>
    </div>

    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <h3 className="text-white font-medium mb-4">Tendencia de Paradas</h3>
     <div className="h-80">
      <AreaChartWidget
       data={data.charts.tendenciaParadas}
       xAxisKey="name"
       yAxisKey="value"
       showLegend={false}
      />
     </div>
    </div>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <h3 className="text-white font-medium mb-4">Paradas por Etapa</h3>
     <div className="h-72">
      <BarChartWidget
       data={data.charts.paradasPorEtapa}
       xAxisKey="name"
       yAxisKey="value"
       showLegend={false}
      />
     </div>
    </div>

    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <h3 className="text-white font-medium mb-4">Disponibilidad por Turno</h3>
     <div className="h-72">
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
  </div>
 );
}

export default function ParadasDashboard() {
 return (
  <FilterProvider>
   <div className="min-h-screen bg-gray-950">
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
     <div className="max-w-[1600px] mx-auto flex items-center justify-between">
      <div>
       <h1 className="text-2xl font-bold text-white">
        ⏱️ Dashboard de Paradas
       </h1>
       <p className="text-gray-400 text-sm mt-1">
        Disponibilidad y análisis de causas
       </p>
      </div>
      <nav className="flex gap-4">
       <Link
        href="/dashboard/produccion"
        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700"
       >
        Producción
       </Link>
       <Link
        href="/dashboard/paradas"
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
       >
        Paradas
       </Link>
       <Link
        href="/dashboard/calidad"
        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700"
       >
        Calidad
       </Link>
      </nav>
     </div>
    </header>

    <main className="max-w-[1600px] mx-auto p-6">
     <FilterBar showYear showMonth />
     <DashboardContent />
    </main>
   </div>
  </FilterProvider>
 );
}
