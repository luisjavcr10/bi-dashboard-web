import Modal from "./Modal";
import { HiExclamationTriangle } from "react-icons/hi2";

interface ConfirmModalProps {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: () => void;
 title: string;
 message: string;
 confirmText?: string;
 cancelText?: string;
 isLoading?: boolean;
 variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
 isOpen,
 onClose,
 onConfirm,
 title,
 message,
 confirmText = "Confirmar",
 cancelText = "Cancelar",
 isLoading = false,
 variant = "danger",
}: ConfirmModalProps) {
 const variantClasses = {
  danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  warning: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
  info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
 };

 return (
  <Modal
   isOpen={isOpen}
   onClose={onClose}
   title={title}
   size="sm"
   footer={
    <>
     <button
      onClick={onClose}
      disabled={isLoading}
      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50"
     >
      {cancelText}
     </button>
     <button
      onClick={onConfirm}
      disabled={isLoading}
      className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2 ${variantClasses[variant]}`}
     >
      {isLoading && (
       <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {confirmText}
     </button>
    </>
   }
  >
   <div className="flex flex-col items-center text-center">
    <div
     className={`p-3 rounded-full mb-4 ${
      variant === "danger"
       ? "bg-red-500/10 text-red-400"
       : "bg-amber-500/10 text-amber-400"
     }`}
    >
     <HiExclamationTriangle className="w-8 h-8" />
    </div>
    <p className="text-gray-300 mb-2">{message}</p>
    <p className="text-xs text-gray-500">Esta acción no se puede deshacer.</p>
   </div>
  </Modal>
 );
}
