import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietmanPro = Be_Vietnam_Pro({
 weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
 style: ["italic", "normal"],
 subsets: ["latin"],
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
   <body className={`${beVietmanPro.className} antialiased`}>{children}</body>
  </html>
 );
}
