"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface FilterState {
 anio?: number;
 mes?: string;
 planta?: string;
 dia?: string;
 especie?: string;
}

interface FilterContextType {
 filters: FilterState;
 setFilter: (
  key: keyof FilterState,
  value: string | number | undefined
 ) => void;
 clearFilters: () => void;
 getQueryParams: () => string;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
 const [filters, setFilters] = useState<FilterState>({});

 const setFilter = (
  key: keyof FilterState,
  value: string | number | undefined
 ) => {
  setFilters((prev) => ({
   ...prev,
   [key]: value,
  }));
 };

 const clearFilters = () => {
  setFilters({});
 };

 const getQueryParams = () => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
   if (value !== undefined && value !== "") {
    params.append(key, String(value));
   }
  });
  return params.toString();
 };

 return (
  <FilterContext.Provider
   value={{ filters, setFilter, clearFilters, getQueryParams }}
  >
   {children}
  </FilterContext.Provider>
 );
}

export function useFilters() {
 const context = useContext(FilterContext);
 if (!context) {
  throw new Error("useFilters must be used within a FilterProvider");
 }
 return context;
}
