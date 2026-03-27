import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Destinos Oposiciones | Ordena tus plazas por distancia",
  description:
    "Herramienta gratuita para opositores: sube tu listado de plazas y ordénalas por distancia desde tu municipio. Ahorra tiempo eligiendo destinos cercanos.",
  keywords: [
    "oposiciones",
    "destinos oposiciones",
    "ordenar plazas por distancia",
    "municipios oposiciones",
    "herramienta opositores",
  ],
  openGraph: {
    title: "Destinos Oposiciones",
    description:
      "Sube tu Excel de plazas y ordénalas por distancia desde tu municipio de referencia.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
