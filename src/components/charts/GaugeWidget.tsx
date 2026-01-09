"use client";

interface GaugeWidgetProps {
 value: number;
 maxValue?: number;
 title: string;
 suffix?: string;
 thresholds?: {
  warning: number;
  danger: number;
 };
}

export default function GaugeWidget({
 value,
 maxValue = 100,
 title,
 suffix = "%",
 thresholds = { warning: 70, danger: 50 },
}: GaugeWidgetProps) {
 const percentage = Math.min((value / maxValue) * 100, 100);
 const rotation = (percentage / 100) * 180 - 90;

 const getColor = () => {
  if (value >= thresholds.warning) return "#10b981";
  if (value >= thresholds.danger) return "#f59e0b";
  return "#ef4444";
 };

 return (
  <div className="flex flex-col items-center justify-center h-full p-4">
   <span className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
    {title}
   </span>

   <div className="relative w-20 h-12">
    <svg viewBox="0 0 100 60" className="w-full h-full">
     <path
      d="M 10 50 A 40 40 0 0 1 90 50"
      fill="none"
      stroke="#374151"
      strokeWidth="8"
      strokeLinecap="round"
     />
     <path
      d="M 10 50 A 40 40 0 0 1 90 50"
      fill="none"
      stroke={getColor()}
      strokeWidth="8"
      strokeLinecap="round"
      strokeDasharray={`${(percentage / 100) * 126} 126`}
      style={{
       transition: "stroke-dasharray 0.5s ease-in-out, stroke 0.3s ease",
      }}
     />
     <g
      transform={`rotate(${rotation}, 50, 50)`}
      style={{ transition: "transform 0.5s ease-in-out" }}
     >
      <line
       x1="50"
       y1="50"
       x2="50"
       y2="20"
       stroke={getColor()}
       strokeWidth="2"
       strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="4" fill={getColor()} />
     </g>
    </svg>
   </div>

   <div className="text-center mt-1">
    <span className="text-3xl font-bold" style={{ color: getColor() }}>
     {value.toFixed(1)}
    </span>
    <span className="text-lg text-gray-400 ml-1">{suffix}</span>
   </div>

   <div className="flex justify-between w-full text-xs text-gray-500 mt-1 px-2">
    <span>0</span>
    <span>{maxValue}</span>
   </div>
  </div>
 );
}
