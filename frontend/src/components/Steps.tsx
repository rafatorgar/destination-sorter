"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const STEP_DURATION = 3000; // ms per step
const TOTAL_STEPS = 3;

/* ---------- Isometric illustrations (Linear-style) ---------- */

function IllustrationExcel({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Base spreadsheet - isometric */}
      <motion.g
        animate={{ opacity: active ? 1 : 0.3, y: active ? 0 : 5 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back face */}
        <path
          d="M50 120 L100 145 L150 120 L150 50 L100 75 L50 50 Z"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          fill="rgba(255,255,255,0.03)"
        />
        {/* Top face */}
        <path
          d="M50 50 L100 25 L150 50 L100 75 Z"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          fill="rgba(255,255,255,0.05)"
        />
        {/* Row lines */}
        {[65, 80, 95, 110].map((y, i) => (
          <motion.line
            key={i}
            x1={55}
            y1={y - 5 + i * 1.5}
            x2={100}
            y2={y + 12 + i * 1.5}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
            strokeDasharray="2 3"
            animate={{ pathLength: active ? 1 : 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          />
        ))}
        {[65, 80, 95, 110].map((y, i) => (
          <motion.line
            key={`r${i}`}
            x1={100}
            y1={y + 12 + i * 1.5}
            x2={145}
            y2={y - 5 + i * 1.5}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.5"
            strokeDasharray="2 3"
            animate={{ pathLength: active ? 1 : 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          />
        ))}
      </motion.g>

      {/* Small floating sheet above */}
      <motion.g
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 15 }}
        transition={{ duration: 0.5, delay: active ? 0.3 : 0 }}
      >
        <path
          d="M70 45 L100 30 L130 45 L100 60 Z"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
          fill="rgba(255,255,255,0.06)"
        />
        <line x1="85" y1="37" x2="100" y2="45" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <line x1="100" y1="45" x2="115" y2="37" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <line x1="90" y1="43" x2="100" y2="48" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <line x1="100" y1="48" x2="110" y2="43" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      </motion.g>

      {/* Upload arrow */}
      <motion.g
        animate={{
          opacity: active ? 1 : 0,
          y: active ? [0, -6, 0] : 8,
        }}
        transition={{
          duration: active ? 1.5 : 0.3,
          repeat: active ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <line x1="100" y1="18" x2="100" y2="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M94 11 L100 4 L106 11" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.g>
    </svg>
  );
}

function IllustrationLocation({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Base platform */}
      <motion.g
        animate={{ opacity: active ? 1 : 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <path
          d="M100 150 L145 127 L145 107 L100 130 L55 107 L55 127 Z"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          fill="rgba(255,255,255,0.03)"
        />
        <path
          d="M55 107 L100 130 L145 107 L100 84 Z"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          fill="rgba(255,255,255,0.05)"
        />
        {[95, 107, 119].map((y, i) => (
          <motion.line
            key={i}
            x1={65 + i * 5}
            y1={y}
            x2={100}
            y2={y + 17 - i * 5}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            animate={{ pathLength: active ? 1 : 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          />
        ))}
      </motion.g>

      {/* Pin */}
      <motion.g
        animate={{
          opacity: active ? 1 : 0.2,
          y: active ? [0, -5, 0] : 10,
        }}
        transition={{
          duration: active ? 2 : 0.5,
          repeat: active ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <path
          d="M100 90 C100 90 120 65 120 50 C120 38 111 28 100 28 C89 28 80 38 80 50 C80 65 100 90 100 90 Z"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
          fill="rgba(255,255,255,0.06)"
        />
        <circle cx="100" cy="50" r="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="rgba(255,255,255,0.05)" />
        <circle cx="100" cy="50" r="3" fill="rgba(255,255,255,0.15)" />
      </motion.g>

      {/* Pulse rings - only when active */}
      {active && [0, 1, 2].map((i) => (
        <motion.ellipse
          key={i}
          cx="100"
          cy="107"
          rx="12"
          ry="6"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
          fill="none"
          initial={{ scale: 1, opacity: 0.2 }}
          animate={{ scale: 1 + i * 0.8, opacity: 0 }}
          transition={{ duration: 2.5, delay: i * 0.8, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

function IllustrationDownload({ active }: { active: boolean }) {
  const bars = [
    { w: 90, y: 125, opacity: 0.25 },
    { w: 75, y: 105, opacity: 0.2 },
    { w: 60, y: 85, opacity: 0.15 },
    { w: 45, y: 65, opacity: 0.1 },
    { w: 30, y: 45, opacity: 0.08 },
  ];

  return (
    <svg viewBox="0 0 200 180" fill="none" className="w-full h-full">
      {/* Stacked sorted results */}
      <motion.g
        animate={{ opacity: active ? 1 : 0.3 }}
        transition={{ duration: 0.5 }}
      >
        {bars.map((bar, i) => (
          <motion.g
            key={i}
            animate={{
              opacity: active ? 1 : 0.3,
              x: active ? 0 : -10,
            }}
            transition={{ duration: 0.4, delay: active ? i * 0.12 : 0 }}
          >
            {/* Top face */}
            <path
              d={`M${70} ${bar.y} L${70 + bar.w / 2} ${bar.y - 10} L${70 + bar.w} ${bar.y} L${70 + bar.w / 2} ${bar.y + 10} Z`}
              stroke={`rgba(255,255,255,${bar.opacity + 0.1})`}
              strokeWidth="1"
              fill={`rgba(255,255,255,${bar.opacity * 0.3})`}
            />
            {/* Front face */}
            <path
              d={`M${70} ${bar.y} L${70 + bar.w / 2} ${bar.y + 10} L${70 + bar.w / 2} ${bar.y + 22} L${70} ${bar.y + 12} Z`}
              stroke={`rgba(255,255,255,${bar.opacity})`}
              strokeWidth="1"
              fill={`rgba(255,255,255,${bar.opacity * 0.2})`}
            />
            {/* Right face */}
            <path
              d={`M${70 + bar.w / 2} ${bar.y + 10} L${70 + bar.w} ${bar.y} L${70 + bar.w} ${bar.y + 12} L${70 + bar.w / 2} ${bar.y + 22} Z`}
              stroke={`rgba(255,255,255,${bar.opacity})`}
              strokeWidth="1"
              fill={`rgba(255,255,255,${bar.opacity * 0.15})`}
            />
          </motion.g>
        ))}
      </motion.g>

      {/* Download arrow */}
      <motion.g
        animate={{
          opacity: active ? 1 : 0,
          y: active ? [0, 6, 0] : -8,
        }}
        transition={{
          duration: active ? 1.5 : 0.3,
          repeat: active ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <line x1="155" y1="60" x2="155" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M149 94 L155 101 L161 94" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="145" y1="108" x2="165" y2="108" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
      </motion.g>

      {/* km labels */}
      {[125, 105, 85].map((y, i) => (
        <motion.text
          key={i}
          x="55"
          y={y + 8}
          fill={`rgba(255,255,255,${0.2 - i * 0.05})`}
          fontSize="7"
          fontFamily="monospace"
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ delay: active ? 0.3 + i * 0.1 : 0 }}
        >
          {[12, 45, 89][i]}km
        </motion.text>
      ))}
    </svg>
  );
}

/* ---------- Steps data ---------- */

const steps = [
  {
    number: "01",
    title: "Sube tu Excel",
    description: 'Solo necesitas un archivo Excel con una columna "MUNICIPIO".',
  },
  {
    number: "02",
    title: "Indica tu municipio",
    description: "Escribe tu localidad de referencia para medir distancias.",
  },
  {
    number: "03",
    title: "Descarga el resultado",
    description: "Listado ordenado por distancia en kilómetros, listo para usar.",
  },
];

const illustrations = [IllustrationExcel, IllustrationLocation, IllustrationDownload];

/* ---------- Component ---------- */

export default function Steps() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % TOTAL_STEPS);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, []);

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

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Illustration = illustrations[i];
            const isActive = activeStep === i;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                onMouseEnter={() => setActiveStep(i)}
                className="cursor-default"
              >
                {/* Illustration container */}
                <motion.div
                  animate={{
                    borderColor: isActive
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0)",
                  }}
                  transition={{ duration: 0.4 }}
                  className="bg-[#111] rounded-2xl p-6 aspect-[4/3] flex items-center justify-center mb-5 overflow-hidden border"
                >
                  <Illustration active={isActive} />
                </motion.div>

                {/* Text */}
                <motion.div
                  animate={{ opacity: isActive ? 1 : 0.5 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <motion.span
                      animate={{
                        color: isActive
                          ? "rgba(0,0,0,0.9)"
                          : "rgba(0,0,0,0.3)",
                      }}
                      transition={{ duration: 0.4 }}
                      className="text-xs font-mono"
                    >
                      {step.number}
                    </motion.span>
                    <h3 className="text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Progress bar under active step */}
                <div className="mt-4 h-0.5 bg-muted/30 rounded-full overflow-hidden">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        key={`progress-${i}`}
                        className="h-full bg-foreground/20 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: STEP_DURATION / 1000, ease: "linear" }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
