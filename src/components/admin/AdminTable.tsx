import { ReactNode } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { HiInbox } from "react-icons/hi2";

export interface Column<T> {
 key: string;
 label: string;
 align?: "left" | "center" | "right";
 render?: (item: T) => ReactNode;
}

interface AdminTableProps<T> {
 data: T[];
 columns: Column<T>[];
 isLoading?: boolean;
}

export default function AdminTable<T extends { id: string }>({
 data,
 columns,
 isLoading,
}: AdminTableProps<T>) {
 if (isLoading) {
  return <EmptyState isLoading={true} />;
 }

 if (data.length === 0) {
  return (
   <EmptyState
    title="No hay registros"
    message="No se encontraron datos para mostrar en esta tabla."
    icon={HiInbox}
   />
  );
 }

 return (
  <div className="w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 shadow-sm">
   <div className="overflow-x-auto">
    <table className="w-full text-left text-sm text-gray-400">
     <thead className="bg-gray-900 text-gray-200 uppercase tracking-wider font-medium text-xs">
      <tr>
       {columns.map((col) => (
        <th
         key={col.key}
         scope="col"
         className={`px-6 py-3 text-${col.align || "left"}`}
        >
         {col.label}
        </th>
       ))}
      </tr>
     </thead>
     <tbody className="divide-y divide-gray-800">
      {data.map((item) => (
       <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
        {columns.map((col) => (
         <td
          key={`${item.id}-${col.key}`}
          className={`px-6 py-4 whitespace-nowrap text-${col.align || "left"}`}
         >
          {col.render
           ? col.render(item)
           : (item as unknown as Record<string, ReactNode>)[col.key] || "-"}
         </td>
        ))}
       </tr>
      ))}
     </tbody>
    </table>
   </div>
  </div>
 );
}
