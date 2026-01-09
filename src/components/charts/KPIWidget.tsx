"use client";

interface KPIWidgetProps {
 title: string;
 value: number | string;
 previousValue?: number;
 prefix?: string;
 suffix?: string;
 format?: "number" | "currency" | "percent";
 compact?: boolean;
}

function formatValue(
 value: number | string,
 format?: string,
 prefix?: string,
 suffix?: string
): string {
 if (typeof value === "string") return value;

 let formatted: string;
 switch (format) {
  case "currency":
   formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 1,
   }).format(value);
   break;
  case "percent":
   formatted = `${value.toFixed(1)}%`;
   break;
  default:
   formatted = new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 1,
   }).format(value);
 }

 return `${prefix || ""}${formatted}${suffix || ""}`;
}

function calculateChange(
 current: number | string,
 previous?: number
): number | null {
 if (typeof current === "string" || !previous) return null;
 return ((current - previous) / previous) * 100;
}

export default function KPIWidget({
 title,
 value,
 previousValue,
 prefix,
 suffix,
 format = "number",
 compact = false,
}: KPIWidgetProps) {
 const change = calculateChange(value, previousValue);
 const isPositive = change !== null && change >= 0;

 return (
  <div
   className={`flex flex-col justify-center h-full ${compact ? "p-3" : "p-4"}`}
  >
   <span
    className={`font-medium text-gray-400 uppercase tracking-wide truncate ${
     compact ? "text-[10px]" : "text-sm"
    }`}
   >
    {title}
   </span>
   <div className="w-full overflow-x-auto scrollbar-hide">
    <span
     className={`font-bold text-white block whitespace-nowrap ${
      compact ? "text-xl mt-1" : "text-3xl mt-2"
     }`}
    >
     {formatValue(value, format, prefix, suffix)}
    </span>
   </div>
   {change !== null && (
    <div className={`flex items-center ${compact ? "mt-1" : "mt-2"}`}>
     <span
      className={`font-medium ${
       isPositive ? "text-emerald-400" : "text-red-400"
      } ${compact ? "text-xs" : "text-sm"}`}
     >
      {isPositive ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
     </span>
     <span
      className={`text-gray-500 ml-2 whitespace-nowrap ${
       compact ? "text-[10px]" : "text-xs"
      }`}
     >
      vs anterior
     </span>
    </div>
   )}
  </div>
 );
}
