"use client";

interface KPIWidgetProps {
 title: string;
 value: number | string;
 previousValue?: number;
 prefix?: string;
 suffix?: string;
 format?: "number" | "currency" | "percent";
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
    minimumFractionDigits: 0,
   }).format(value);
   break;
  case "percent":
   formatted = `${value.toFixed(1)}%`;
   break;
  default:
   formatted = new Intl.NumberFormat("es-MX").format(value);
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
}: KPIWidgetProps) {
 const change = calculateChange(value, previousValue);
 const isPositive = change !== null && change >= 0;

 return (
  <div className="flex flex-col justify-center h-full p-4">
   <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
    {title}
   </span>
   <span className="text-4xl font-bold text-white mt-2">
    {formatValue(value, format, prefix, suffix)}
   </span>
   {change !== null && (
    <div className="flex items-center mt-2">
     <span
      className={`text-sm font-medium ${
       isPositive ? "text-emerald-400" : "text-red-400"
      }`}
     >
      {isPositive ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
     </span>
     <span className="text-xs text-gray-500 ml-2">vs anterior</span>
    </div>
   )}
  </div>
 );
}
