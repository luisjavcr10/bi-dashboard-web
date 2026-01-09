import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const geistSans = localFont({
 src: "./fonts/GeistVF.woff",
 variable: "--font-geist-sans",
 weight: "100 900",
});
const geistMono = localFont({
 src: "./fonts/GeistMonoVF.woff",
 variable: "--font-geist-mono",
 weight: "100 900",
});

export const metadata: Metadata = {
 title: "BI Dashboard - Peru SAC",
 description: "Sistema de Inteligencia de Negocios de Procesadora Peru SAC",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <html lang="es">
   <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
    <div className="flex h-screen bg-gray-950">
     <Sidebar />
     <main className="flex-1 w-full min-w-0 bg-gray-950 transition-all duration-300 overflow-y-auto">
      {children}
     </main>
    </div>
   </body>
  </html>
 );
}
