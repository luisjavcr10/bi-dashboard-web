"use client";

import { IconType } from "react-icons";

interface DashboardHeaderProps {
 title: string;
 icon: IconType;
}

export default function DashboardHeader({
 title,
 icon: Icon,
}: DashboardHeaderProps) {
 return (
  <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 w-fit px-4 py-2 rounded-full mb-6">
   <Icon className="w-5 h-5 text-indigo-400" />
   <h1 className="text-lg font-semibold text-white tracking-wide">{title}</h1>
  </div>
 );
}
