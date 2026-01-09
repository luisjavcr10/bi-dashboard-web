"use client";

import { useEffect, useState } from "react";
import { FilterProvider, FilterBar, useFilters } from "@/components/filters";
import { BarChartWidget, KPIWidget, TableWidget } from "@/components/charts";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { HiCheckBadge, HiExclamationCircle } from "react-icons/hi2";
import EmptyState from "@/components/ui/EmptyState";

interface DashboardData {
 kpis: {
  productosCorrectos: number;
  totalProcesos: number;
 };
 charts: {
  calidadPorTurno: { name: string; value: number; procesos: number }[];
  calidadPorProducto: { name: string; especie: string; value: number }[];
 };
 tables: {
  topEmpleados: {
   NombreCompleto: string;
   AntiguedadAnios: number;
   ProductosCorrectos: number;
   TotalProcesos: number;
   PromedioProductos: number;
  }[];
  oeeEmpleados: {
   NombreCompleto: string;
   ProductosCorrectos: number;
   DuracionTurno: number;
   OEE: number;
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
    const url = `/api/dashboard/calidad${queryParams ? `?${queryParams}` : ""}`;
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
   {/* Column 1: Stacked KPIs (2 items) */}
   <div className="md:col-span-1 lg:row-span-2 flex flex-col gap-4 min-h-0">
    <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl flex flex-col justify-center shadow-lg shadow-gray-950/50 p-4 min-h-[140px]">
     <KPIWidget
      title="Productos Correctos"
      value={data.kpis.productosCorrectos}
      format="number"
     />
    </div>
    <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl flex flex-col justify-center shadow-lg shadow-gray-950/50 p-4 min-h-[140px]">
     <KPIWidget
      title="Total Procesos"
      value={data.kpis.totalProcesos}
      format="number"
     />
    </div>
   </div>

   {/* Grid: 2x2 Charts */}
   {/* Top Left */}
   <div className="md:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col min-h-[300px] lg:min-h-0 shadow-lg shadow-gray-950/50">
    <h3 className="text-white font-medium mb-4 shrink-0">Calidad por Turno</h3>
    <div className="flex-1 min-h-0">
     <BarChartWidget
      data={data.charts.calidadPorTurno}
      xAxisKey="name"
      yAxisKey="value"
      showLegend={false}
      colors={["#10b981"]}
     />
    </div>
   </div>

   {/* Top Right */}
   <div className="md:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col min-h-[300px] lg:min-h-0 shadow-lg shadow-gray-950/50">
    <h3 className="text-white font-medium mb-4 shrink-0">
     Calidad por Producto
    </h3>
    <div className="flex-1 min-h-0">
     <BarChartWidget
      data={data.charts.calidadPorProducto}
      xAxisKey="name"
      yAxisKey="value"
      showLegend={false}
     />
    </div>
   </div>

   {/* Bottom Left: OEE Empleados Table */}
   <div className="md:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col min-h-[300px] lg:min-h-0 shadow-lg shadow-gray-950/50">
    <h3 className="text-white font-medium mb-4 shrink-0">OEE de Empleados</h3>
    <div className="flex-1 min-h-0 overflow-hidden">
     <TableWidget
      data={data.tables.oeeEmpleados}
      columns={[
       { key: "NombreCompleto", label: "Empleado" },
       { key: "OEE", label: "OEE %", align: "right" },
       { key: "ProductosCorrectos", label: "Prod.", align: "right" },
      ]}
     />
    </div>
   </div>

   {/* Bottom Right */}
   <div className="md:col-span-2 bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col min-h-[300px] lg:min-h-0 shadow-lg shadow-gray-950/50">
    <h3 className="text-white font-medium mb-4 shrink-0">Top Empleados</h3>
    <div className="flex-1 min-h-0 overflow-hidden">
     <TableWidget
      data={data.tables.topEmpleados}
      columns={[
       { key: "NombreCompleto", label: "Empleado" },
       { key: "AntiguedadAnios", label: "Años", align: "center" },
       { key: "ProductosCorrectos", label: "Productos", align: "right" },
       { key: "PromedioProductos", label: "Prom", align: "right" },
      ]}
     />
    </div>
   </div>
  </div>
 );
}

export default function CalidadDashboard() {
 return (
  <FilterProvider>
   <div className="h-full flex flex-col p-3 lg:p-6 gap-4 overflow-y-auto lg:overflow-hidden">
    <div className="flex-none flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
     <DashboardHeader title="Dashboard de Calidad" icon={HiCheckBadge} />
     <FilterBar showYear showMonth showDay />
    </div>
    <DashboardContent />
   </div>
  </FilterProvider>
 );
}
