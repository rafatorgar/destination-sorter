"use client";

import { motion } from "framer-motion";

const cx = 500;
const cy = 250;

const destinations = [
  { name: "Toledo",     x: 445, y: 185 },
  { name: "Madrid",     x: 430, y: 140 },
  { name: "Córdoba",    x: 360, y: 310 },
  { name: "Valencia",   x: 680, y: 230 },
  { name: "Zaragoza",   x: 660, y: 120 },
  { name: "Murcia",     x: 720, y: 340 },
  { name: "Sevilla",    x: 210, y: 360 },
  { name: "Bilbao",     x: 340, y: 55  },
  { name: "Málaga",     x: 300, y: 420 },
  { name: "Barcelona",  x: 850, y: 90  },
];

const radarRings = [60, 120, 180, 250];
const radarDuration = 5;
const radarMinR = 10;
const radarMaxR = 420;

function getPixelDist(x: number, y: number) {
  return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
}

// For a given pixel distance, what fraction of radarDuration until the pulse reaches it
function getRevealFraction(pixelDist: number) {
  return Math.max(0, Math.min(1, (pixelDist - radarMinR) / (radarMaxR - radarMinR)));
}

export default function DestinationRadar() {
  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[2/1] bg-foreground rounded-2xl overflow-hidden shadow-2xl">
      {/* Dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.12]">
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 500"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Static guide rings */}
        {radarRings.map((r) => (
          <circle
            key={"static-" + r}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="white"
            strokeOpacity={0.12}
            strokeWidth={0.8}
          />
        ))}

        {/* Radar pulse — using scale transform since r animation doesn't work well */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={1}
          fill="none"
          stroke="white"
          strokeWidth={2}
          animate={{
            scale: [radarMinR, 380],
            opacity: [1, 0.7, 0.4, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: radarDuration,
            scale: { ease: "linear" },
            opacity: { ease: "linear", times: [0, 0.3, 0.7, 1] },
          }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Glow */}
        <defs>
          <radialGradient id="glow">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="60%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={45} fill="url(#glow)" />

        {/* Destinations — looping with radar */}
        {destinations.map((dest) => {
          const pixelDist = getPixelDist(dest.x, dest.y);
          const revealFrac = getRevealFraction(pixelDist);

          // Keyframe times as fractions of the cycle [0..1]
          // appear instantly when pulse arrives, brief hold, then fade as pulse moves on
          const t0 = Math.max(0, revealFrac - 0.005); // just before pulse arrives
          const t1 = revealFrac;                        // pulse arrives — pop in instantly
          const t2 = Math.min(0.99, revealFrac + 0.2);  // longer hold
          const t3 = Math.min(1, revealFrac + 0.5);     // slower fade out

          // Convert to keyframe arrays for opacity
          // times:   0 ... t0 ... t1 ... t2 ... t3 ... 1
          // opacity: 0      0     1      1      0      0
          const opacityKeyframes = [0, 0, 1, 1, 0, 0];
          const times = [0, t0, t1, t2, t3, 1];

          const mx = cx + (dest.x - cx) * 0.45;
          const my = cy + (dest.y - cy) * 0.45;

          return (
            <motion.g
              key={dest.name}
              animate={{ opacity: opacityKeyframes }}
              transition={{
                repeat: Infinity,
                duration: radarDuration,
                times,
                ease: "linear",
              }}
            >
              {/* Line */}
              <line
                x1={cx}
                y1={cy}
                x2={dest.x}
                y2={dest.y}
                stroke="white"
                strokeOpacity={0.25}
                strokeWidth={0.8}
                strokeDasharray="4 4"
              />

              {/* Diamond */}
              <rect
                x={mx - 2.5}
                y={my - 2.5}
                width={5}
                height={5}
                fill="white"
                fillOpacity={0.4}
                transform={`rotate(45 ${mx} ${my})`}
              />

              {/* Dot */}
              <circle
                cx={dest.x}
                cy={dest.y}
                r={3.5}
                fill="white"
                fillOpacity={0.55}
                stroke="white"
                strokeOpacity={0.3}
                strokeWidth={1}
              />

              {/* Label */}
              <text
                x={dest.x + (dest.x < cx ? -10 : 10)}
                y={dest.y + 4}
                fill="white"
                fillOpacity={0.6}
                fontSize={13}
                fontWeight={500}
                textAnchor={dest.x < cx ? "end" : "start"}
              >
                {dest.name}
              </text>
            </motion.g>
          );
        })}

        {/* Center label */}
        <text
          x={cx}
          y={cy + 5}
          fill="white"
          fillOpacity={0.7}
          fontSize={14}
          fontWeight={600}
          textAnchor="middle"
        >
          Tú
        </text>
      </svg>
    </div>
  );
}
