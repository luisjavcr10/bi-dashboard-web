import Link from "next/link";
import { HiHome } from "react-icons/hi2";

export default function NotFound() {
 return (
  <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
   <div className="text-center space-y-6 max-w-lg">
    <div className="space-y-2">
     <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse">
      404
     </h1>
     <h2 className="text-3xl font-semibold text-white">Página no encontrada</h2>
    </div>
    <p className="text-gray-400 text-lg">
     Lo sentimos, la página que estás buscando no existe o ha sido movida.
    </p>
    <div>
     <Link
      href="/"
      className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20"
     >
      <HiHome className="w-5 h-5 mr-2" />
      Volver al Inicio
     </Link>
    </div>
   </div>
  </div>
 );
}
