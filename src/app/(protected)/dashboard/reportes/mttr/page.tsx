"use client";

import { useEffect, useState } from "react";
import FilterBar from "@/components/filters/FilterBar";
import { useFilters } from "@/components/filters/FilterContext";
import { HiWrench, HiDocumentArrowDown } from "react-icons/hi2";
import TableWidget from "@/components/charts/TableWidget";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useAgentStore } from "@/store/agentStore";
import { exportToPDF } from "@/lib/pdfExport";

// ... imports
import { FilterProvider } from "@/components/filters/FilterContext";

interface MTTRDataRow {
 Fecha: string;
 Planta: string;
 Turno: string;
 Causa: string;
 NParadas: number;
 TotalMinParada: number;
 MTTR_Min: string; // After toFixed(2) it becomes a string
 [key: string]: unknown;
}

function MTTRReportContent() {
 const { filters } = useFilters();
 const [data, setData] = useState<MTTRDataRow[]>([]);
 // ... existing state and useEffect logic ...
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 // ... setDashboardContext ...
 const setDashboardContext = useAgentStore(
  (state) => state.setDashboardContext
 );

 const columns = [
  { key: "Fecha", label: "Fecha" },
  { key: "Planta", label: "Planta" },
  { key: "Turno", label: "Turno" },
  { key: "Causa", label: "Causa" },
  { key: "NParadas", label: "N° Paradas", align: "center" as const },
  { key: "TotalMinParada", label: "Min. Parada", align: "right" as const },
  { key: "MTTR_Min", label: "MTTR (Min)", align: "right" as const },
 ];

 const handleExportPDF = () => {
  exportToPDF("Reporte MTTR", columns, data);
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

    const res = await fetch(`/api/reports/mttr?${queryParams.toString()}`);
    const json = await res.json();

    if (json.status === "ok") {
     const formattedData = json.data.map((row: Record<string, unknown>) => ({
      ...row,
      Fecha: (row.Fecha as { value: string })?.value || row.Fecha,
      MTTR_Min: row.MTTR_Min
       ? parseFloat(String(row.MTTR_Min)).toFixed(2)
       : "0.00",
     }));
     setData(formattedData);
     setDashboardContext("Reporte MTTR", { data: formattedData });
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
   <DashboardHeader title="Reporte MTTR" icon={HiWrench} />
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

export default function MTTRReportPage() {
 return (
  <FilterProvider>
   <MTTRReportContent />
  </FilterProvider>
 );
}
