import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
// Archivo variable con eje de ancho: la versión expandida es la voz de la plantilla Hype Drop.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument" });

export const metadata: Metadata = {
  title: "Menta — Menú digital con pedidos por WhatsApp",
  description: "Creá el menú digital de tu local y recibí pedidos ordenados por WhatsApp.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${jakarta.variable} ${instrument.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
