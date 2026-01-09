"use client";

import { useEffect, useState } from "react";
import FilterBar from "@/components/filters/FilterBar";
import { useFilters } from "@/components/filters/FilterContext";
import { HiPresentationChartLine, HiDocumentArrowDown } from "react-icons/hi2";
import TableWidget from "@/components/charts/TableWidget";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useAgentStore } from "@/store/agentStore";

import { FilterProvider } from "@/components/filters/FilterContext";
import { exportToPDF } from "@/lib/pdfExport";

interface OEEReportRow {
 Anio: string | number;
 Mes: string;
 Planta: string;
 Turno: string;
 Empleado: string;
 Producto: string;
 TotalUnidadesMes: number;
 DiasTrabajados: number;
 OEE_Ratio: string; // Formatted as "X.XX%"
 [key: string]: unknown;
}

// Removing explicit AgentStoreState interface to rely on store's type inference or simplify

function OEEReportContent() {
 const { filters } = useFilters();
 const [data, setData] = useState<OEEReportRow[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const setDashboardContext = useAgentStore(
  (state) => state.setDashboardContext
 );

 const columns = [
  { key: "Anio", label: "Año", align: "center" as const },
  { key: "Mes", label: "Mes" },
  { key: "Planta", label: "Planta" },
  { key: "Turno", label: "Turno" },
  { key: "Empleado", label: "Empleado" },
  { key: "Producto", label: "Producto" },
  { key: "TotalUnidadesMes", label: "Unidades", align: "right" as const },
  { key: "DiasTrabajados", label: "Días Trab.", align: "center" as const },
  { key: "OEE_Ratio", label: "OEE", align: "right" as const },
 ];

 const handleExportPDF = () => {
  exportToPDF("Reporte OEE", columns, data);
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

    const res = await fetch(`/api/reports/oee?${queryParams.toString()}`);
    const json = await res.json();

    if (json.status === "ok") {
     const formattedData: OEEReportRow[] = json.data.map(
      (row: Record<string, unknown>) => ({
       ...row,
       OEE_Ratio: row.OEE_Ratio
        ? parseFloat(String(row.OEE_Ratio)).toFixed(2) + "%"
        : "0.00%",
      })
     );
     setData(formattedData);
     setDashboardContext("Reporte OEE Empleado", { data: formattedData });
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
   <DashboardHeader title="Reporte OEE" icon={HiPresentationChartLine} />
   <FilterBar showYear showMonth showPlanta>
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

export default function OEEReportPage() {
 return (
  <FilterProvider>
   <OEEReportContent />
  </FilterProvider>
 );
}
