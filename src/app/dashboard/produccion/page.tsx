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
import Link from "next/link";

interface DashboardData {
 kpis: {
  produccionTotal: number;
  mermaTotal: number;
  porcentajeMerma: number;
  totalMallas: number;
 };
 charts: {
  produccionPorEspecie: { name: string; value: number; merma: number }[];
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
   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <KPIWidget
      title="Producción Total"
      value={data.kpis.produccionTotal}
      format="number"
      suffix=" kg"
     />
    </div>
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <KPIWidget
      title="Merma Total"
      value={data.kpis.mermaTotal}
      format="number"
      suffix=" kg"
     />
    </div>
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <KPIWidget
      title="% Merma"
      value={data.kpis.porcentajeMerma}
      format="percent"
     />
    </div>
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <KPIWidget
      title="Total Mallas"
      value={data.kpis.totalMallas}
      format="number"
     />
    </div>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <h3 className="text-white font-medium mb-4">Producción por Especie</h3>
     <div className="h-72">
      <BarChartWidget
       data={data.charts.produccionPorEspecie}
       xAxisKey="name"
       yAxisKey="value"
       showLegend={false}
      />
     </div>
    </div>

    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <h3 className="text-white font-medium mb-4">Tendencia de Merma</h3>
     <div className="h-72">
      <LineChartWidget
       data={data.charts.tendenciaMerma}
       xAxisKey="name"
       yAxisKey="value"
       showLegend={false}
      />
     </div>
    </div>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <h3 className="text-white font-medium mb-4">Merma por Tipo</h3>
     <div className="h-72">
      <PieChartWidget data={data.charts.mermaPorTipo} showLegend />
     </div>
    </div>

    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
     <h3 className="text-white font-medium mb-4">Top Productos con Merma</h3>
     <div className="h-72">
      <TableWidget
       data={data.tables.topProductosMerma}
       columns={[
        { key: "Producto", label: "Producto" },
        { key: "Especie", label: "Especie" },
        { key: "PesoMerma", label: "Merma (kg)", align: "right" },
        { key: "PorcentajeMerma", label: "%", align: "right" },
       ]}
      />
     </div>
    </div>
   </div>
  </div>
 );
}

export default function ProduccionDashboard() {
 return (
  <FilterProvider>
   <div className="min-h-screen bg-gray-950">
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
     <div className="max-w-[1600px] mx-auto flex items-center justify-between">
      <div>
       <h1 className="text-2xl font-bold text-white">
        📊 Dashboard de Producción
       </h1>
       <p className="text-gray-400 text-sm mt-1">
        Métricas de producción y merma
       </p>
      </div>
      <nav className="flex gap-4">
       <Link
        href="/dashboard/produccion"
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
       >
        Producción
       </Link>
       <Link
        href="/dashboard/paradas"
        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700"
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
