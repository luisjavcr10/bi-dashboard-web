"use client";

interface Column {
 key: string;
 label: string;
 align?: "left" | "center" | "right";
}

interface TableWidgetProps {
 data: Record<string, unknown>[];
 columns: Column[];
 maxRows?: number;
}

export default function TableWidget({
 data,
 columns,
 maxRows = 10,
}: TableWidgetProps) {
 const displayData = maxRows ? data.slice(0, maxRows) : data;

 return (
  <div className="h-full overflow-auto">
   <table className="w-full text-sm">
    <thead className="sticky top-0 bg-gray-800">
     <tr>
      {columns.map((col) => (
       <th
        key={col.key}
        className={`px-4 py-3 font-medium text-gray-300 border-b border-gray-700 text-${
         col.align || "left"
        }`}
       >
        {col.label}
       </th>
      ))}
     </tr>
    </thead>
    <tbody>
     {displayData.map((row, rowIndex) => (
      <tr key={rowIndex} className="hover:bg-gray-800/50 transition-colors">
       {columns.map((col) => (
        <td
         key={col.key}
         className={`px-4 py-3 text-gray-200 border-b border-gray-700/50 text-${
          col.align || "left"
         }`}
        >
         {String(row[col.key] ?? "-")}
        </td>
       ))}
      </tr>
     ))}
    </tbody>
   </table>
   {data.length > maxRows && (
    <div className="text-center py-2 text-gray-500 text-xs">
     Mostrando {maxRows} de {data.length} registros
    </div>
   )}
  </div>
 );
}
