"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
 HiBars3,
 HiXMark,
 HiChevronDoubleLeft,
 HiChevronDoubleRight,
 HiChartBar,
 HiClock,
 HiCheckBadge,
} from "react-icons/hi2";
import { clsx } from "clsx";

const MENU_ITEMS = [
 {
  name: "Producción",
  path: "/dashboard/produccion",
  icon: HiChartBar,
 },
 {
  name: "Paradas",
  path: "/dashboard/paradas",
  icon: HiClock,
 },
 {
  name: "Calidad",
  path: "/dashboard/calidad",
  icon: HiCheckBadge,
 },
];

export default function Sidebar() {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [isMobileOpen, setIsMobileOpen] = useState(false);
 const pathname = usePathname();

 useEffect(() => {
  setIsMobileOpen(false);
 }, [pathname]);

 return (
  <>
   {/* Mobile Menu Button - Only visible on mobile when closed */}
   {!isMobileOpen && (
    <button
     className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-gray-900 border border-gray-700 rounded-lg text-white shadow-lg"
     onClick={() => setIsMobileOpen(true)}
    >
     <HiBars3 className="w-6 h-6" />
    </button>
   )}

   {/* Overlay for mobile */}
   {isMobileOpen && (
    <div
     className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
     onClick={() => setIsMobileOpen(false)}
    />
   )}

   {/* Sidebar Container 
          Desktop: sticky top-0 h-screen (occupies space)
          Mobile: fixed inset-y-0 left-0 (overlay)
      */}
   <aside
    className={clsx(
     "bg-gray-950 border-r border-gray-800 transition-all duration-300 ease-in-out flex flex-col z-50",
     // Mobile styles
     "fixed inset-y-0 left-0 lg:relative lg:translate-x-0 h-screen",
     isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
     // Desktop Width styles
     isCollapsed ? "lg:w-20" : "lg:w-64"
    )}
   >
    {/* Header (Logo + Toggle) */}
    <div className="flex items-center justify-between p-4 h-16 border-b border-gray-800 shrink-0">
     <div
      className={clsx(
       "flex items-center overflow-hidden transition-all duration-300",
       isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
      )}
     >
      <h1 className="font-bold text-white text-xl whitespace-nowrap">
       PERU SAC
      </h1>
     </div>

     {/* Mobile Close Button */}
     <button
      onClick={() => setIsMobileOpen(false)}
      className="lg:hidden p-2 text-gray-400 hover:text-white"
     >
      <HiXMark className="w-6 h-6" />
     </button>

     {/* Desktop Collapse Button */}
     <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="hidden lg:flex p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors ml-auto"
     >
      {isCollapsed ? (
       <HiChevronDoubleRight className="w-5 h-5" />
      ) : (
       <HiChevronDoubleLeft className="w-5 h-5" />
      )}
     </button>
    </div>

    {/* Content */}
    <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
     {/* Dashboard Section Divider */}
     <div className="px-4 mb-2 shrink-0">
      {!isCollapsed ? (
       <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider animate-fadeIn">
        Dashboard
       </span>
      ) : (
       <div className="h-px bg-gray-800 w-full my-2" />
      )}
     </div>

     <nav className="px-2 space-y-1">
      {MENU_ITEMS.map((item) => {
       const active = pathname === item.path;
       return (
        <Link
         key={item.path}
         href={item.path}
         className={clsx(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
          active
           ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
           : "text-gray-400 hover:bg-gray-900 hover:text-white",
          isCollapsed ? "justify-center" : ""
         )}
         title={isCollapsed ? item.name : ""}
        >
         <item.icon
          className={clsx(
           "flex-shrink-0 transition-transform duration-200",
           isCollapsed ? "w-6 h-6" : "w-5 h-5",
           active && "scale-110"
          )}
         />

         <span
          className={clsx(
           "font-medium whitespace-nowrap transition-all duration-300 origin-left",
           isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
          )}
         >
          {item.name}
         </span>

         {/* Tooltip for collapsed mode */}
         {isCollapsed && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-gray-900 border border-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
           {item.name}
          </div>
         )}
        </Link>
       );
      })}
     </nav>
    </div>

    {/* User Info (Footer) */}
    <div
     className={clsx(
      "p-4 border-t border-gray-800 shrink-0 transition-all duration-300",
      isCollapsed ? "items-center justify-center flex" : ""
     )}
    >
     <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
       AD
      </div>
      {!isCollapsed && (
       <div className="flex flex-col overflow-hidden">
        <span className="text-sm font-medium text-white truncate">Admin</span>
        <span className="text-xs text-gray-500 truncate">
         admin@perusac.com
        </span>
       </div>
      )}
     </div>
    </div>
   </aside>
  </>
 );
}
