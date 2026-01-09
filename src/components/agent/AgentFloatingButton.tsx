"use client";

import { useState } from "react";
import { FaUserAstronaut } from "react-icons/fa";
import { HiSparkles, HiChatBubbleLeftRight } from "react-icons/hi2";
import Modal from "@/components/ui/Modal";
import { useAgentStore } from "@/store/agentStore";
import { usePathname } from "next/navigation";

export default function AgentFloatingButton() {
 const [isOpen, setIsOpen] = useState(false);
 const [loading, setLoading] = useState(false);
 const { dashboardName, dashboardData, chats, addMessage } = useAgentStore();
 const pathname = usePathname();

 // Allowed paths for the agent
 const allowedPaths = [
  "/dashboard/produccion",
  "/dashboard/calidad",
  "/dashboard/paradas",
 ];

 const isVisible = allowedPaths.includes(pathname);

 // Get messages for current dashboard, or empty array
 const currentMessages = dashboardName ? chats[dashboardName] || [] : [];

 const handleAnalyze = async () => {
  if (!dashboardData || !dashboardName) return;

  setLoading(true);
  addMessage(dashboardName, {
   role: "user",
   content: `Analiza el dashboard de ${dashboardName}`,
  });

  try {
   const res = await fetch("/api/agent/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dashboardName, data: dashboardData }),
   });

   const json = await res.json();

   if (json.status === "ok") {
    addMessage(dashboardName, { role: "agent", content: json.response });
   } else {
    addMessage(dashboardName, {
     role: "agent",
     content: "Lo siento, hubo un error al analizar los datos.",
    });
   }
  } catch (error) {
   console.error(error);
   addMessage(dashboardName, {
    role: "agent",
    content: "Error de conexión con el agente.",
   });
  } finally {
   setLoading(false);
  }
 };

 if (!isVisible) return null;

 return (
  <>
   <button
    onClick={() => setIsOpen(true)}
    className="fixed bottom-6 right-6 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl shadow-indigo-500/50 transition-all hover:scale-110 z-50 group border border-indigo-400"
    aria-label="Abrir agente"
   >
    <FaUserAstronaut className="w-8 h-8" />
   </button>

   <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title={`Agente IA - ${dashboardName || "Sin contexto"}`}
   >
    <div className="flex flex-col h-[500px]">
     {/* Chat Container */}
     <div className="flex-1 overflow-y-auto space-y-4 p-4 mb-4 bg-gray-900/50 rounded-lg border border-gray-800 custom-scrollbar">
      {currentMessages.length === 0 ? (
       <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
        <div className="p-4 bg-gray-800 rounded-full">
         <HiSparkles className="w-8 h-8 text-yellow-500" />
        </div>
        <div className="text-center">
         <p className="text-lg font-medium text-white">
          Hola! Soy tu asistente IA.
         </p>
         <p className="text-sm mt-1">
          Estoy listo para analizar los datos del dashboard de{" "}
          <span className="text-indigo-400 font-bold">
           {dashboardName || "..."}
          </span>
          .
         </p>
        </div>
        {dashboardData && (
         <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
         >
          <HiChatBubbleLeftRight className="w-4 h-4" />
          ¿Deseas analizar este dashboard?
         </button>
        )}
       </div>
      ) : (
       <>
        {currentMessages.map((msg, idx) => (
         <div
          key={idx}
          className={`flex ${
           msg.role === "user" ? "justify-end" : "justify-start"
          }`}
         >
          <div
           className={`max-w-[85%] p-3 rounded-2xl text-sm ${
            msg.role === "user"
             ? "bg-indigo-600 text-white rounded-br-none"
             : "bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700"
           }`}
          >
           <div className="prose prose-invert prose-sm max-w-none">
            {msg.role === "agent" ? (
             <div
              dangerouslySetInnerHTML={{
               __html: msg.content
                .replace(/\n/g, "<br/>")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
             />
            ) : (
             msg.content
            )}
           </div>
          </div>
         </div>
        ))}
        {loading && (
         <div className="flex justify-start animate-pulse">
          <div className="bg-gray-800 text-gray-400 px-4 py-2 rounded-2xl rounded-bl-none text-xs border border-gray-700">
           Analizando datos...
          </div>
         </div>
        )}
       </>
      )}
     </div>
    </div>
   </Modal>
  </>
 );
}
