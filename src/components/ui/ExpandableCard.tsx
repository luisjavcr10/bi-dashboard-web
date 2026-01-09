"use client";

import { useState, ReactNode } from "react";
import { HiArrowsPointingOut } from "react-icons/hi2";
import Modal from "@/components/ui/Modal";

interface ExpandableCardProps {
 title: string;
 children: ReactNode;
 className?: string;
}

export default function ExpandableCard({
 title,
 children,
 className = "",
}: ExpandableCardProps) {
 const [isExpanded, setIsExpanded] = useState(false);

 return (
  <>
   <div
    className={`bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col shadow-lg shadow-gray-950/50 relative group cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-indigo-500/50 ${className}`}
    onClick={() => setIsExpanded(true)}
   >
    <div className="flex justify-between items-start mb-4 shrink-0">
     <h3 className="text-white font-medium">{title}</h3>
     <button
      className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
      aria-label="Expandir"
      onClick={(e) => {
       e.stopPropagation();
       setIsExpanded(true);
      }}
     >
      <HiArrowsPointingOut className="w-5 h-5" />
     </button>
    </div>
    <div className="flex-1 min-h-0 pointer-events-none group-hover:pointer-events-auto">
     {/* pointer-events-none by default to clicking anywhere triggers card, 
              but we might want to interact with chart tooltips. 
              Let's keep tooltips working by removing pointer-events-none, 
              but layout is absolute overlay? No. 
              Standard behavior: clicking chart opens modal. Tooltip hover works. 
          */}
     {children}
    </div>
   </div>

   <Modal
    isOpen={isExpanded}
    onClose={() => setIsExpanded(false)}
    title={title}
    size="xl"
   >
    <div className="h-[60vh] w-full">{children}</div>
   </Modal>
  </>
 );
}
