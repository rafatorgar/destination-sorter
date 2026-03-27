"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import ExcelIcon from "@/components/icons/ExcelIcon";
import DownloadIcon from "@/components/icons/DownloadIcon";

const steps = [
  {
    number: "1",
    title: "Sube tu Excel",
    description:
      'El archivo debe tener al menos una columna llamada "MUNICIPIO". Si tiene "PROVINCIA", se usará como apoyo para localizar mejor cada destino.',
    icon: <ExcelIcon className="w-10 h-10" />,
  },
  {
    number: "2",
    title: "Indica tu municipio",
    description:
      "Escribe el nombre de tu localidad de referencia desde la que quieres medir las distancias en coche.",
    icon: (
      <Image
        src="/google-maps-icon.png"
        alt="Google Maps"
        width={40}
        height={40}
      />
    ),
  },
  {
    number: "3",
    title: "Descarga el resultado",
    description:
      "Recibirás tu Excel con una nueva columna de distancia en kilómetros, ordenado de más cerca a más lejos.",
    icon: <DownloadIcon className="w-10 h-10" />,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1 },
};

const lineVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
};

function ConnectorLine({ delay }: { delay: number }) {
  return (
    <div className="hidden md:flex items-center justify-center -mx-3 z-10">
      <motion.svg
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        viewBox="0 0 80 40"
        fill="none"
        className="w-full h-8 text-muted-foreground/30"
      >
        <motion.path
          variants={lineVariants}
          transition={{ duration: 0.6, delay, ease: "easeInOut" as const }}
          d="M0 20 C20 8, 35 32, 50 18 S70 28, 80 20"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
        {/* Arrow tip */}
        <motion.path
          variants={lineVariants}
          transition={{ duration: 0.3, delay: delay + 0.5, ease: "easeOut" as const }}
          d="M72 14 L80 20 L72 26"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </motion.svg>
    </div>
  );
}

export default function Steps() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center text-foreground mb-4"
        >
          ¿Cómo funciona?
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-16"
        >
          <Image
            src="/google-maps-icon.png"
            alt="Google Maps"
            width={20}
            height={20}
          />
          <span className="text-sm text-muted-foreground">
            Distancias reales con Google Maps
          </span>
        </motion.div>

        {/* Steps grid with connectors */}
        <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-0 md:gap-0 gap-y-6 items-center">
          {steps.map((step, i) => (
            <div key={step.number} className="contents">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.4 }}
                variants={cardVariants}
              >
                <Card className="h-full text-center glass hover:shadow-md transition-all duration-300">
                  <CardContent className="pt-8 pb-6 px-6">
                    <motion.div
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-100px" }}
                      variants={iconVariants}
                      transition={{
                        duration: 0.4,
                        delay: i * 0.4 + 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="flex justify-center mb-4 text-foreground"
                    >
                      {step.icon}
                    </motion.div>
                    <div className="w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center text-sm font-bold mx-auto mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {i < steps.length - 1 && (
                <ConnectorLine delay={i * 0.4 + 0.5} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
