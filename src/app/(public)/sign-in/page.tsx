"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HiExclamationCircle } from "react-icons/hi2";

export default function SignInPage() {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const router = useRouter();

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
   const res = await signIn("credentials", {
    email,
    password,
    redirect: false,
   });

   if (res?.error) {
    setError("Credenciales inválidas");
    setLoading(false);
   } else {
    router.push("/");
    router.refresh();
   }
  } catch {
   setError("Ocurrió un error al iniciar sesión");
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
   <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
    <div className="p-8">
     <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
      <p className="text-gray-400">Ingresa a tu cuenta para continuar</p>
     </div>

     {error && (
      <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
       <HiExclamationCircle className="w-5 h-5 shrink-0" />
       <p className="text-sm font-medium">{error}</p>
      </div>
     )}

     <form onSubmit={handleSubmit} className="space-y-6">
      <div>
       <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-300 mb-2"
       >
        Correo Electrónico
       </label>
       <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        placeholder="nombre@empresa.com"
        required
       />
      </div>

      <div>
       <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-300 mb-2"
       >
        Contraseña
       </label>
       <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        placeholder="••••••••"
        required
       />
      </div>

      <button
       type="submit"
       disabled={loading}
       className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-900/20 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
       {loading ? (
        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
       ) : (
        "Iniciar Sesión"
       )}
      </button>
     </form>
    </div>
   </div>
  </div>
 );
}
