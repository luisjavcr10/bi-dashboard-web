"use client";

import { useFilters } from "./FilterContext";
import SelectFilter from "./SelectFilter";

const YEARS = [2024, 2025, 2026].map((y) => ({ value: y, label: String(y) }));
const MONTHS = [
 { value: "January", label: "Enero" },
 { value: "February", label: "Febrero" },
 { value: "March", label: "Marzo" },
 { value: "April", label: "Abril" },
 { value: "May", label: "Mayo" },
 { value: "June", label: "Junio" },
 { value: "July", label: "Julio" },
 { value: "August", label: "Agosto" },
 { value: "September", label: "Septiembre" },
 { value: "October", label: "Octubre" },
 { value: "November", label: "Noviembre" },
 { value: "December", label: "Diciembre" },
];

const DAYS = [
 { value: "Monday", label: "Lunes" },
 { value: "Tuesday", label: "Martes" },
 { value: "Wednesday", label: "Miércoles" },
 { value: "Thursday", label: "Jueves" },
 { value: "Friday", label: "Viernes" },
 { value: "Saturday", label: "Sábado" },
 { value: "Sunday", label: "Domingo" },
];

const TURNOS = [
 { value: "Mañana", label: "Mañana" },
 { value: "Tarde", label: "Tarde" },
];

interface FilterBarProps {
 showYear?: boolean;
 showMonth?: boolean;
 showDay?: boolean;
 showPlanta?: boolean;
 showTurno?: boolean;
 plantas?: string[];
}

export default function FilterBar({
 showYear = true,
 showMonth = true,
 showDay = false,
 showPlanta = false,
 showTurno = false,
 plantas = [],
}: FilterBarProps) {
 const { clearFilters } = useFilters();

 return (
  <div className="flex flex-wrap items-end gap-3 p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
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
   {showDay && (
    <SelectFilter id="filter-dia" label="Día" options={DAYS} filterKey="dia" />
   )}
   {showTurno && (
    <SelectFilter
     id="filter-turno"
     label="Turno"
     options={TURNOS}
     filterKey="turno"
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
    className="h-10 px-4 bg-gray-800 text-gray-400 rounded-lg text-sm hover:bg-gray-700 transition-colors border border-gray-700 hover:text-white"
   >
    Limpiar
   </button>
  </div>
 );
}
