import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const BASE_URL = "https://destinosoposiciones.rafatorresgarcia.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Destinos Oposiciones | Ordena tus plazas por distancia",
    template: "%s | Destinos Oposiciones",
  },
  description:
    "Herramienta gratuita para opositores: sube tu listado de plazas y ordénalas por distancia desde tu municipio. Ahorra tiempo eligiendo destinos cercanos.",
  keywords: [
    "oposiciones",
    "destinos oposiciones",
    "ordenar plazas por distancia",
    "municipios oposiciones",
    "herramienta opositores",
    "bolsa de interinos",
    "concurso de traslados",
    "distancia plazas oposiciones",
    "elegir destino oposiciones",
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Destinos Oposiciones | Ordena tus plazas por distancia",
    description:
      "Sube tu Excel de plazas y ordénalas por distancia desde tu municipio de referencia. Herramienta gratuita para opositores.",
    type: "website",
    locale: "es_ES",
    url: BASE_URL,
    siteName: "Destinos Oposiciones",
  },
  twitter: {
    card: "summary_large_image",
    title: "Destinos Oposiciones | Ordena tus plazas por distancia",
    description:
      "Sube tu Excel de plazas y ordénalas por distancia desde tu municipio de referencia.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <JsonLd />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BYQ8584M7S"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BYQ8584M7S');
          `}
        </Script>
      </head>
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
