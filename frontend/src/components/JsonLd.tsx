const BASE_URL = "https://destinosoposiciones.rafatorresgarcia.com";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Destinos Oposiciones",
  url: BASE_URL,
  description:
    "Herramienta gratuita para opositores: sube tu listado de plazas y ordénalas por distancia desde tu municipio usando Google Maps.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  author: {
    "@type": "Person",
    name: "Rafa Torres García",
    url: "https://rafatorresgarcia.com",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cómo puedo ordenar los destinos de mi oposición por cercanía?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con Destinos Oposiciones puedes hacerlo en segundos. Solo tienes que subir el listado oficial de plazas en formato Excel, indicar tu municipio de referencia y la herramienta calcula la distancia real en coche a cada destino, devolviendo el listado ordenado de más cerca a más lejos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Existe alguna herramienta para saber qué plazas de oposiciones están más cerca de mi casa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, exactamente para eso hemos creado Destinos Oposiciones. Introduces tu localidad y la herramienta calcula automáticamente la distancia en kilómetros por carretera a cada plaza del listado, para que puedas elegir destino con toda la información.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo elegir el mejor destino en unas oposiciones?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La distancia a tu domicilio es uno de los factores clave. Con esta herramienta puedes ver de un vistazo qué plazas están más cerca y descartar las que quedan demasiado lejos, ahorrándote horas de búsquedas manuales en Google Maps.",
      },
    },
    {
      "@type": "Question",
      name: "¿Se puede calcular la distancia a todas las plazas de una oposición a la vez?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. En lugar de buscar cada municipio uno a uno en Google Maps, subes el Excel completo con todas las plazas y la herramienta calcula todas las distancias en una sola operación, devolviendo el archivo ya ordenado.",
      },
    },
    {
      "@type": "Question",
      name: "¿Funciona para bolsas de empleo, traslados y comisiones de servicio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Destinos Oposiciones funciona con cualquier listado que incluya municipios: oposiciones, bolsas de interinos, concursos de traslados, comisiones de servicio o cualquier proceso de selección pública.",
      },
    },
    {
      "@type": "Question",
      name: "¿La distancia que calcula es en línea recta o por carretera?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La distancia se calcula por carretera, usando la ruta en coche real a través de Google Maps. Esto te da una estimación mucho más precisa que la distancia en línea recta.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo usarlo para oposiciones de cualquier comunidad autónoma?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. La herramienta funciona con municipios de toda España. Da igual que las plazas estén en Andalucía, Cataluña, Madrid o cualquier otra comunidad. Solo necesitas que el Excel tenga los nombres de los municipios.",
      },
    },
  ],
};

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
