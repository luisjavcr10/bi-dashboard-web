import Link from "next/link";

export default function Home() {
 return (
  <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
   <div className="text-center max-w-2xl">
    <div className="text-6xl mb-6">📊</div>
    <h1 className="text-5xl font-bold text-white mb-4">BI Dashboard</h1>
    <p className="text-xl text-gray-400 mb-8">
     Plataforma de visualización de datos inspirada en Power BI. Crea dashboards
     interactivos con gráficos, KPIs y tablas.
    </p>
    <div className="flex gap-4 justify-center">
     <Link
      href="/dashboard"
      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25"
     >
      Ver Dashboard Demo
     </Link>
     <Link
      href="/api"
      className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-all border border-gray-700"
     >
      API Status
     </Link>
    </div>
   </div>

   <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
    <div className="p-4">
     <div className="text-3xl mb-2">📈</div>
     <div className="text-gray-300 font-medium">6 tipos de gráficos</div>
    </div>
    <div className="p-4">
     <div className="text-3xl mb-2">🎛️</div>
     <div className="text-gray-300 font-medium">Filtros interactivos</div>
    </div>
    <div className="p-4">
     <div className="text-3xl mb-2">🔄</div>
     <div className="text-gray-300 font-medium">Drag & Drop</div>
    </div>
    <div className="p-4">
     <div className="text-3xl mb-2">🗄️</div>
     <div className="text-gray-300 font-medium">MongoDB</div>
    </div>
   </div>
  </div>
 );
}
