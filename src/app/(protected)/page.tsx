"use client";

import Link from "next/link";
import {
 HiChartBar,
 HiClock,
 HiCheckBadge,
 HiArrowRight,
} from "react-icons/hi2";

const MODULES = [
 {
  title: "Producción",
  description:
   "Monitoreo de eficiencia productiva, control de merma y análisis por especie.",
  icon: HiChartBar,
  href: "/dashboard/produccion",
  color: "from-blue-600 to-indigo-600",
  shadow: "shadow-blue-900/20",
 },
 {
  title: "Paradas",
  description:
   "Control de tiempos muertos, disponibilidad de planta y gestión de causas.",
  icon: HiClock,
  href: "/dashboard/paradas",
  color: "from-indigo-600 to-purple-600",
  shadow: "shadow-indigo-900/20",
 },
 {
  title: "Calidad",
  description:
   "Evaluación de desempeño de personal, calidad de empaque y rankings.",
  icon: HiCheckBadge,
  href: "/dashboard/calidad",
  color: "from-purple-600 to-pink-600",
  shadow: "shadow-purple-900/20",
 },
];

export default function HomePage() {
 return (
  <div className="min-h-screen bg-gray-950 text-white p-8 lg:p-12 flex flex-col justify-center items-center">
   <div className="max-w-7xl w-full">
    <div className="mb-16 text-center lg:text-left">
     <h1 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
      Bienvenido a{" "}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
       PERU SAC
      </span>
     </h1>
     <p className="text-gray-400 text-xl max-w-2xl leading-relaxed">
      Sistema de Inteligencia de Negocios para el monitoreo y análisis integral
      de procesos productivos.
     </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
     {MODULES.map((module) => (
      <Link
       key={module.href}
       href={module.href}
       className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden backdrop-blur-sm"
      >
       {/* Hover Gradient Background */}
       <div
        className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
       />

       <div className="relative z-10 flex flex-col h-full">
        <div
         className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white shadow-lg ${module.shadow} mb-8 transform group-hover:scale-110 transition-transform duration-300`}
        >
         <module.icon className="w-8 h-8" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
         {module.title}
        </h2>

        <p className="text-gray-400 mb-8 flex-grow leading-relaxed text-lg">
         {module.description}
        </p>

        <div className="flex items-center text-base font-medium text-gray-500 group-hover:text-white transition-colors mt-auto">
         Acceder al Dashboard{" "}
         <HiArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
        </div>
       </div>
      </Link>
     ))}
    </div>

    <footer className="mt-20 text-center lg:text-left border-t border-gray-800 pt-8">
     <p className="text-sm text-gray-500">
      © {new Date().getFullYear()} Procesadora Peru SAC - BI Dashboard v1.0
     </p>
    </footer>
   </div>
  </div>
 );
}
