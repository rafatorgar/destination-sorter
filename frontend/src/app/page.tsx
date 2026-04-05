"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MapPin from "@/components/icons/MapPin";
import Steps from "@/components/Steps";
import DestinationRadar from "@/components/DestinationRadar";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.5, ease: "easeInOut" as const },
  },
};

const faqs = [
  {
    question: "¿Cómo puedo ordenar los destinos de mi oposición por cercanía?",
    answer:
      "Con Destinos Oposiciones puedes hacerlo en segundos. Solo tienes que subir el listado oficial de plazas en formato Excel, indicar tu municipio de referencia y la herramienta calcula la distancia real en coche a cada destino, devolviendo el listado ordenado de más cerca a más lejos.",
  },
  {
    question:
      "¿Existe alguna herramienta para saber qué plazas de oposiciones están más cerca de mi casa?",
    answer:
      "Sí, exactamente para eso hemos creado Destinos Oposiciones. Introduces tu localidad y la herramienta calcula automáticamente la distancia en kilómetros por carretera a cada plaza del listado, para que puedas elegir destino con toda la información.",
  },
  {
    question: "¿Cómo elegir el mejor destino en unas oposiciones?",
    answer:
      "La distancia a tu domicilio es uno de los factores clave. Con esta herramienta puedes ver de un vistazo qué plazas están más cerca y descartar las que quedan demasiado lejos, ahorrándote horas de búsquedas manuales en Google Maps.",
  },
  {
    question:
      "¿Se puede calcular la distancia a todas las plazas de una oposición a la vez?",
    answer:
      "Sí. En lugar de buscar cada municipio uno a uno en Google Maps, subes el Excel completo con todas las plazas y la herramienta calcula todas las distancias en una sola operación, devolviendo el archivo ya ordenado.",
  },
  {
    question:
      "¿Funciona para bolsas de empleo, traslados y comisiones de servicio?",
    answer:
      "Sí. Destinos Oposiciones funciona con cualquier listado que incluya municipios: oposiciones, bolsas de interinos, concursos de traslados, comisiones de servicio o cualquier proceso de selección pública.",
  },
  {
    question:
      "¿Cómo organizar las plazas de una bolsa de interinos por distancia?",
    answer:
      "El proceso es el mismo que con cualquier oposición. Descarga el listado de plazas de la bolsa, súbelo a la herramienta, indica tu municipio y obtendrás el Excel con todas las localidades ordenadas por distancia en coche desde tu domicilio.",
  },
  {
    question: "¿La distancia que calcula es en línea recta o por carretera?",
    answer:
      "La distancia se calcula por carretera, usando la ruta en coche real a través de Google Maps. Esto te da una estimación mucho más precisa que la distancia en línea recta.",
  },
  {
    question: "¿Puedo usarlo para oposiciones de cualquier comunidad autónoma?",
    answer:
      "Sí. La herramienta funciona con municipios de toda España. Da igual que las plazas estén en Andalucía, Cataluña, Madrid o cualquier otra comunidad. Solo necesitas que el Excel tenga los nombres de los municipios.",
  },
  {
    question:
      "Acabo de aprobar la oposición y tengo que elegir destino, ¿por dónde empiezo?",
    answer:
      "Lo primero es descargar el listado oficial de vacantes que publica la administración (suele estar en PDF o Excel). Si está en PDF, conviértelo a Excel. Luego súbelo a Destinos Oposiciones, indica tu municipio de referencia y tendrás todas las plazas ordenadas por distancia en segundos. A partir de ahí puedes filtrar tus opciones reales y ordenar tus preferencias con datos concretos, no a ojo.",
  },
  {
    question:
      "¿Cómo ordeno un listado de adjudicación de destinos por cercanía a mi casa?",
    answer:
      "La adjudicación de destinos suele publicarse como un listado con decenas o cientos de municipios. En lugar de buscarlos uno a uno en Google Maps, sube el Excel a la herramienta e introduce tu domicilio como municipio de referencia. En pocos minutos tendrás todas las plazas ordenadas de la más cercana a la más lejana, con la distancia por carretera calculada automáticamente.",
  },
  {
    question:
      "Me han publicado las vacantes y solo tengo unos días para ordenarlas, ¿cómo lo hago rápido?",
    answer:
      "Cuando el plazo para ordenar preferencias es corto, lo peor que puedes hacer es calcular distancias una por una. Con Destinos Oposiciones subes el listado completo, procesas todas las distancias de golpe y descargas el resultado en CSV. En menos de cinco minutos tienes una base objetiva para priorizar tus opciones, y te queda tiempo para valorar otros factores como coste de vida o transporte.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-28 px-6 text-center">
        <div className="absolute inset-0 -z-10" />

        {/* Decorative route lines */}
        <motion.svg
          initial="hidden"
          animate="visible"
          className="absolute top-16 left-0 w-full h-24 -z-10 text-muted-foreground/15"
          viewBox="0 0 1200 100"
          fill="none"
          preserveAspectRatio="none"
        >
          <motion.path
            variants={draw}
            d="M-20 60 C200 20, 350 80, 500 40 S750 70, 900 30 S1100 60, 1220 45"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="8 6"
            strokeLinecap="round"
          />
        </motion.svg>
        <motion.svg
          initial="hidden"
          animate="visible"
          className="absolute bottom-10 left-0 w-full h-20 -z-10 text-muted-foreground/10"
          viewBox="0 0 1200 80"
          fill="none"
          preserveAspectRatio="none"
        >
          <motion.path
            variants={draw}
            d="M-20 30 C150 60, 300 10, 500 50 S800 20, 1000 55 S1150 25, 1220 40"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="6 5"
            strokeLinecap="round"
          />
        </motion.svg>

        {/* Decorative pins */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute top-12 left-[12%] text-muted-foreground/15 hidden lg:block"
        >
          <MapPin className="w-8 h-8" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute top-24 right-[15%] text-muted-foreground/20 hidden lg:block"
        >
          <MapPin className="w-6 h-6" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-20 left-[20%] text-muted-foreground/10 hidden lg:block"
        >
          <MapPin className="w-5 h-5" />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-3xl mx-auto relative"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6"
          >
            Ordena
            <span className="text-muted-foreground">
              {" "}
              tus destinos de oposiciones
            </span>{" "}
            por distancia
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.15, ease: "easeOut" }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Sube tu listado de plazas en Excel, indica tu municipio de
            referencia y obtén el archivo ordenado por distancia en kilómetros.
            Así de sencillo.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="mb-12"
          >
            <Link href="/herramienta">
              <Button
                size="lg"
                className="text-base px-8 py-6 rounded-xl bg-foreground text-background hover:bg-foreground/90"
              >
                Subir mis destinos
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          <DestinationRadar />
        </motion.div>
      </section>

      {/* Cómo funciona */}
      <Steps />

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center text-foreground mb-4"
          >
            Todo lo que necesitas para elegir destino
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto"
          >
            Deja de buscar municipios uno a uno en Google Maps. Sube tu listado
            y obtén resultados al instante.
          </motion.p>

          <div className="space-y-20">
            {/* Feature 1: Radar — closest destinations filter */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Tus 20 destinos más cercanos
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  De cientos de plazas, el radar filtra automáticamente las 20
                  más cercanas a tu municipio. Tú en el centro, los destinos
                  alrededor con nombre y distancia. Lo esencial, de un vistazo.
                </p>
                <Link href="/herramienta">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Ver mis destinos cercanos
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <div className="bg-foreground rounded-xl p-6 aspect-[4/3] flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 300 220" fill="none" className="w-full h-full">
                    {/* Rings */}
                    <circle cx="150" cy="110" r="30" stroke="white" strokeOpacity="0.1" strokeWidth="0.8" />
                    <circle cx="150" cy="110" r="60" stroke="white" strokeOpacity="0.08" strokeWidth="0.8" />
                    <circle cx="150" cy="110" r="90" stroke="white" strokeOpacity="0.06" strokeWidth="0.8" />
                    {/* Center */}
                    <circle cx="150" cy="110" r="3" fill="white" fillOpacity="0.15" />
                    <text x="150" y="126" fill="white" fillOpacity="0.5" fontSize="7" textAnchor="middle" fontWeight="600">Tú</text>
                    {/* Destinations with labels */}
                    {[
                      { x: 172, y: 88, name: "Montemayor", km: "12" },
                      { x: 128, y: 92, name: "Fernán Núñez", km: "15" },
                      { x: 185, y: 115, name: "Moriles", km: "22" },
                      { x: 115, y: 130, name: "Lucena", km: "30" },
                      { x: 200, y: 80, name: "Cabra", km: "38" },
                      { x: 100, y: 75, name: "Rute", km: "45" },
                      { x: 210, y: 140, name: "Priego", km: "52" },
                      { x: 90, y: 150, name: "Baena", km: "55" },
                    ].map((d, i) => (
                      <g key={i}>
                        <circle cx={d.x} cy={d.y} r="2" fill="white" fillOpacity="0.5" />
                        <text x={d.x + 5} y={d.y - 4} fill="white" fillOpacity="0.55" fontSize="5.5" fontWeight="500">{d.name}</text>
                        <text x={d.x + 5} y={d.y + 3} fill="white" fillOpacity="0.25" fontSize="4.5">{d.km} km</text>
                      </g>
                    ))}
                    {/* Ring labels */}
                    <text x="183" y="108" fill="white" fillOpacity="0.2" fontSize="5">20 km</text>
                    <text x="213" y="108" fill="white" fillOpacity="0.2" fontSize="5">40 km</text>
                  </svg>
                </div>
              </motion.div>
            </motion.div>

            {/* Feature 2: Real map */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="md:order-2">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Todos los destinos en el mapa
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  Visualiza cada plaza sobre el mapa real. Los destinos
                  más cercanos aparecen más grandes y oscuros, los lejanos se
                  atenúan. Haz clic en cualquier punto para ver municipio y
                  distancia exacta.
                </p>
                <Link href="/herramienta">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Obtener mi mapa
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="md:order-1">
                <div className="bg-foreground rounded-xl p-6 aspect-[4/3] flex items-center justify-center overflow-hidden relative">
                  <svg viewBox="0 0 300 260" fill="none" className="w-full h-full">
                    {/* Córdoba province silhouette */}
                    <path
                      d="M80 30 L95 25 L120 20 L145 18 L170 20 L195 22 L215 28 L230 35 L240 30 L248 38 L245 50 L250 60 L248 72 L240 80 L235 90 L228 95 L225 105 L220 112 L210 118 L205 125 L210 135 L215 145 L220 155 L218 168 L210 178 L200 188 L190 198 L182 205 L175 212 L165 218 L155 222 L142 225 L130 222 L118 218 L108 210 L98 200 L88 192 L78 182 L72 172 L68 160 L65 148 L62 138 L60 128 L58 118 L55 108 L52 98 L50 88 L52 78 L55 68 L58 55 L62 45 L68 38 L75 32 Z"
                      fill="white"
                      fillOpacity="0.05"
                      stroke="white"
                      strokeOpacity="0.15"
                      strokeWidth="1"
                    />
                    {/* Origin — Montilla */}
                    <circle cx="160" cy="170" r="5" fill="black" stroke="white" strokeWidth="2" />
                    <circle cx="160" cy="170" r="12" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="2 2" />
                    {/* Nearby destinations */}
                    {[
                      { x: 148, y: 158, r: 3.5, o: 0.7 },
                      { x: 172, y: 162, r: 3.2, o: 0.65 },
                      { x: 140, y: 180, r: 3, o: 0.6 },
                      { x: 178, y: 178, r: 2.8, o: 0.55 },
                      { x: 125, y: 192, r: 2.5, o: 0.5 },
                      { x: 192, y: 190, r: 2.2, o: 0.45 },
                      { x: 185, y: 145, r: 2, o: 0.4 },
                    ].map((d, i) => (
                      <circle key={`near-${i}`} cx={d.x} cy={d.y} r={d.r} fill="white" fillOpacity={d.o} />
                    ))}
                    {/* Medium distance */}
                    {[
                      { x: 168, y: 118, r: 2, o: 0.35 },
                      { x: 130, y: 130, r: 1.6, o: 0.3 },
                      { x: 200, y: 130, r: 1.5, o: 0.28 },
                    ].map((d, i) => (
                      <circle key={`mid-${i}`} cx={d.x} cy={d.y} r={d.r} fill="white" fillOpacity={d.o} />
                    ))}
                    {/* Far destinations */}
                    {[
                      { x: 155, y: 55, r: 1.2, o: 0.2 },
                      { x: 130, y: 65, r: 1.1, o: 0.18 },
                      { x: 185, y: 50, r: 1.1, o: 0.18 },
                      { x: 110, y: 85, r: 1, o: 0.15 },
                      { x: 200, y: 70, r: 1, o: 0.15 },
                    ].map((d, i) => (
                      <circle key={`far-${i}`} cx={d.x} cy={d.y} r={d.r} fill="white" fillOpacity={d.o} />
                    ))}
                    {/* Popup example */}
                    <rect x="100" y="140" width="42" height="16" rx="3" fill="white" fillOpacity="0.12" />
                    <text x="105" y="148" fontSize="4.5" fontWeight="600" fill="white" fillOpacity="0.9">Lucena</text>
                    <text x="105" y="153" fontSize="3.5" fill="white" fillOpacity="0.5">29.8 km</text>
                  </svg>
                </div>
              </motion.div>
            </motion.div>

            {/* Feature 3: Table — text left, visual right */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Tabla ordenada con todos los datos
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  Todas las plazas de tu listado ordenadas de más cerca a más
                  lejos, con la distancia en kilómetros por carretera. Conserva
                  todas las columnas originales del Excel: códigos de centro,
                  provincia, tipo de plaza y todo lo que necesitas.
                </p>
                <Link href="/herramienta">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Ordenar mis plazas
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <div className="bg-foreground rounded-xl p-5 overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white/40 font-medium pb-2 pr-4">km</th>
                        <th className="text-left text-white/40 font-medium pb-2 pr-4">Municipio</th>
                        <th className="text-left text-white/40 font-medium pb-2 pr-4">Provincia</th>
                        <th className="text-left text-white/40 font-medium pb-2">Centro</th>
                      </tr>
                    </thead>
                    <tbody className="text-white/60">
                      {[
                        ["12.3", "Montemayor", "Córdoba", "CEIP San José"],
                        ["15.5", "Fernán Núñez", "Córdoba", "IES Llano"],
                        ["22.1", "Moriles", "Córdoba", "CEIP Cervantes"],
                        ["24.0", "Santacruz", "Córdoba", "CPR Sierra"],
                        ["29.8", "Lucena", "Córdoba", "IES Marqués"],
                        ["38.4", "Cabra", "Córdoba", "CEIP Alcalá"],
                      ].map(([km, mun, prov, centro], i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-1.5 pr-4 font-semibold text-white/80">{km}</td>
                          <td className="py-1.5 pr-4 font-medium text-white/70">{mun}</td>
                          <td className="py-1.5 pr-4">{prov}</td>
                          <td className="py-1.5">{centro}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>

            {/* Feature 4: Download — text right, visual left */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="md:order-2">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Descarga tu resultado
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  Exporta el listado completo con las distancias calculadas.
                  Llévatelo en CSV para abrirlo en Excel, Google Sheets o donde
                  prefieras. Compártelo con otros opositores o úsalo como
                  referencia al elegir destino.
                </p>
                <Link href="/herramienta">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Descargar mi listado
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <div className="bg-foreground rounded-xl p-8 flex flex-col items-center justify-center aspect-[4/3]">
                  <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white/40 mb-4">
                    <path d="M24 6v26M14 22l10 10 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 34v6a4 4 0 004 4h24a4 4 0 004-4v-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <div className="text-white/50 text-sm font-medium mb-1">destinos_desde_montilla.csv</div>
                  <div className="text-white/25 text-xs">156 destinos · 12 columnas · 24 KB</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQs + CTA — unified container with dashed side borders */}
      <div className="max-w-5xl mx-auto border-x border-dashed border-border">
        {/* FAQs inside white box */}
        <section className="bg-white border-y border-dashed border-border py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-center text-foreground mb-12"
            >
              Preguntas frecuentes
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
            >
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-base font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* Gap — dashed side borders continue over off-white background */}
        <div className="py-10" />

        {/* CTA inside white box */}
        <section className="bg-white border-y border-dashed border-border py-20 px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-foreground mb-2"
            >
              ¿Listo para organizar tus destinos?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-muted-foreground mb-8"
            >
              Sube tu Excel y obtén las distancias en segundos.
            </motion.p>
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Link href="/herramienta">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-6 rounded-xl"
                >
                  Subir mis destinos
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </>
  );
}
