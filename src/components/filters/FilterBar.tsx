"use client";

import { useFilters } from "./FilterContext";
import SelectFilter from "./SelectFilter";

const YEARS = [2024, 2025, 2026].map((y) => ({ value: y, label: String(y) }));
const MONTHS = [
 { value: "Enero", label: "Enero" },
 { value: "Febrero", label: "Febrero" },
 { value: "Marzo", label: "Marzo" },
 { value: "Abril", label: "Abril" },
 { value: "Mayo", label: "Mayo" },
 { value: "Junio", label: "Junio" },
 { value: "Julio", label: "Julio" },
 { value: "Agosto", label: "Agosto" },
 { value: "Septiembre", label: "Septiembre" },
 { value: "Octubre", label: "Octubre" },
 { value: "Noviembre", label: "Noviembre" },
 { value: "Diciembre", label: "Diciembre" },
];

interface FilterBarProps {
 showYear?: boolean;
 showMonth?: boolean;
 showPlanta?: boolean;
 plantas?: string[];
}

export default function FilterBar({
 showYear = true,
 showMonth = true,
 showPlanta = false,
 plantas = [],
}: FilterBarProps) {
 const { clearFilters } = useFilters();

 return (
  <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
   {showYear && (
    <SelectFilter
     id="filter-anio"
     label="Año"
     options={YEARS}
     filterKey="anio"
    />
   )}
   {showMonth && (
    <SelectFilter
     id="filter-mes"
     label="Mes"
     options={MONTHS}
     filterKey="mes"
    />
   )}
   {showPlanta && plantas.length > 0 && (
    <SelectFilter
     id="filter-planta"
     label="Planta"
     options={plantas.map((p) => ({ value: p, label: p }))}
     filterKey="planta"
    />
   )}
   <button
    onClick={clearFilters}
    className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm hover:bg-gray-700 transition-colors"
   >
    Limpiar Filtros
   </button>
  </div>
 );
}
