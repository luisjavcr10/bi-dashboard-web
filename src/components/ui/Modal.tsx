import { ReactNode } from "react";
import { HiXMark } from "react-icons/hi2";

interface ModalProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
 children: ReactNode;
 footer?: ReactNode;
 size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
 isOpen,
 onClose,
 title,
 children,
 footer,
 size = "md",
}: ModalProps) {
 if (!isOpen) return null;

 const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
 };

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
   <div
    className={`bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full ${sizeClasses[size]} overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]`}
   >
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
     <h3 className="text-lg font-bold text-white">{title}</h3>
     <button
      onClick={onClose}
      className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
     >
      <HiXMark className="w-5 h-5" />
     </button>
    </div>

    {/* Content */}
    <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>

    {/* Footer */}
    {footer && (
     <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3 shrink-0">
      {footer}
     </div>
    )}
   </div>
  </div>
 );
}
