"use client";

import { useEffect, useState } from "react";
import FilterBar from "@/components/filters/FilterBar";
import { useFilters } from "@/components/filters/FilterContext";
import { HiCheckCircle, HiDocumentArrowDown } from "react-icons/hi2";
import TableWidget from "@/components/charts/TableWidget";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useAgentStore } from "@/store/agentStore";

import { FilterProvider } from "@/components/filters/FilterContext";
import { exportToPDF } from "@/lib/pdfExport";

function DisponibilidadReportContent() {
 const { filters } = useFilters();
 const [data, setData] = useState<Record<string, unknown>[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const setDashboardContext = useAgentStore(
  (state) => state.setDashboardContext
 );

 const columns = [
  { key: "Fecha", label: "Fecha" },
  { key: "Planta", label: "Planta" },
  { key: "Turno", label: "Turno" },
  { key: "TurnoMin", label: "Min. Turno", align: "right" as const },
  { key: "ParadaMin", label: "Min. Parada", align: "right" as const },
  {
   key: "Disponibilidad_Porcentaje",
   label: "Disponibilidad",
   align: "right" as const,
  },
 ];

 const handleExportPDF = () => {
  exportToPDF("Reporte Disponibilidad", columns, data);
 };

 useEffect(() => {
  const fetchData = async () => {
   setLoading(true);
   try {
    const queryParams = new URLSearchParams();
    if (filters.anio) queryParams.set("anio", filters.anio.toString());
    if (filters.mes) queryParams.set("mes", filters.mes);
    if (filters.dia) queryParams.set("dia", filters.dia);
    if (filters.planta) queryParams.set("planta", filters.planta);

    const res = await fetch(
     `/api/reports/disponibilidad?${queryParams.toString()}`
    );
    const json = await res.json();

    if (json.status === "ok") {
     const formattedData = json.data.map((row: Record<string, unknown>) => ({
      ...row,
      Fecha: (row.Fecha as { value: string })?.value || row.Fecha,
      Disponibilidad_Porcentaje: row.Disponibilidad_Porcentaje
       ? parseFloat(String(row.Disponibilidad_Porcentaje)).toFixed(2) + "%"
       : "0.00%",
     }));
     setData(formattedData);
     setDashboardContext("Reporte Disponibilidad", { data: formattedData });
    } else {
     setError(json.message);
    }
   } catch (err) {
    console.error(err);
    setError("Error al cargar el reporte");
   } finally {
    setLoading(false);
   }
  };

  fetchData();
 }, [filters, setDashboardContext]);

 return (
  <div className="p-6 space-y-6">
   <DashboardHeader title="Reporte Disponibilidad" icon={HiCheckCircle} />
   <FilterBar showYear showMonth showDay showPlanta>
    <button
     onClick={handleExportPDF}
     disabled={loading || data.length === 0}
     className="flex items-center gap-2 h-10 px-4 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
     <HiDocumentArrowDown className="w-5 h-5" />
     Exportar PDF
    </button>
   </FilterBar>

   {loading ? (
    <div className="flex justify-center items-center h-64">
     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
   ) : error ? (
    <EmptyState title="Error" message={error} />
   ) : (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-lg shadow-gray-950/50 overflow-hidden">
     <TableWidget data={data} columns={columns} />
    </div>
   )}
  </div>
 );
}

export default function DisponibilidadReportPage() {
 return (
  <FilterProvider>
   <DisponibilidadReportContent />
  </FilterProvider>
 );
}
