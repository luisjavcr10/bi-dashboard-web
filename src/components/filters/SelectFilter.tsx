"use client";

import { useFilters } from "./FilterContext";

interface SelectFilterProps {
 id: string;
 label: string;
 options: { value: string | number; label: string }[];
 filterKey: "anio" | "mes" | "planta" | "turno" | "especie";
}

export default function SelectFilter({
 id,
 label,
 options,
 filterKey,
}: SelectFilterProps) {
 const { filters, setFilter } = useFilters();

 return (
  <div className="flex flex-col gap-1">
   <label htmlFor={id} className="text-xs font-medium text-gray-400 uppercase">
    {label}
   </label>
   <select
    id={id}
    value={filters[filterKey] ?? ""}
    onChange={(e) => setFilter(filterKey, e.target.value || undefined)}
    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
   >
    <option value="">Todos</option>
    {options.map((opt) => (
     <option key={opt.value} value={opt.value}>
      {opt.label}
     </option>
    ))}
   </select>
  </div>
 );
}
