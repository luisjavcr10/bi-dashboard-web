import { ReactNode } from "react";
import { HiInbox } from "react-icons/hi2";

interface EmptyStateProps {
 title?: string;
 message?: string;
 icon?: React.ElementType;
 action?: ReactNode;
 isLoading?: boolean;
}

export default function EmptyState({
 title = "No hay datos",
 message = "No se encontraron registros para mostrar.",
 icon: Icon = HiInbox,
 action,
 isLoading,
}: EmptyStateProps) {
 if (isLoading) {
  return (
   <div className="flex flex-col flex-1 w-full h-full items-center justify-center p-8 text-center min-h-[200px] animate-fadeIn">
    <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
    <h3 className="text-lg font-medium text-gray-200">
     Cargando información...
    </h3>
    <p className="text-sm text-gray-500 mt-1">Por favor espere un momento.</p>
   </div>
  );
 }

 return (
  <div className="flex flex-col flex-1 w-full h-full items-center justify-center p-8 text-center border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/30 min-h-[200px] animate-fadeIn">
   <div className="p-3 bg-gray-800 rounded-full mb-4">
    <Icon className="w-8 h-8 text-gray-500" />
   </div>
   <h3 className="text-lg font-medium text-gray-200 mb-1">{title}</h3>
   <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">{message}</p>
   {action && <div>{action}</div>}
  </div>
 );
}
