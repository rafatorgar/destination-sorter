"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Destino {
  municipio: string;
  distancia: number;
}

interface ResultsRadarProps {
  origen: string;
  destinos: Destino[];
}

const KM_PER_RING = 20;
const PX_PER_KM = 4;

export default function ResultsRadar({ origen, destinos }: ResultsRadarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const allValid = destinos.filter((d) => d.distancia > 0 && d.distancia < Infinity);
  const valid = allValid.slice(0, 20);
  const maxDist = valid.length > 0 ? Math.max(...valid.map((d) => d.distancia)) : 100;

  const canvasR = maxDist * PX_PER_KM + 100;
  const cx = canvasR;
  const cy = canvasR;
  const viewSize = canvasR * 2;

  // Rings
  const ringCount = Math.ceil(maxDist / KM_PER_RING);
  const rings = Array.from({ length: ringCount }, (_, i) => (i + 1) * KM_PER_RING);

  // Stable angle per destination based on name hash, so positions don't jump when list changes
  const points = useMemo(() => {
    return valid.map((dest, i) => {
      // Hash the name to get a stable angle
      let hash = 0;
      for (let j = 0; j < dest.municipio.length; j++) {
        hash = ((hash << 5) - hash + dest.municipio.charCodeAt(j)) | 0;
      }
      const angle = ((Math.abs(hash) % 3600) / 3600) * 2 * Math.PI;
      const r = dest.distancia * PX_PER_KM;
      return {
        ...dest,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        key: `${dest.municipio}-${dest.distancia}`,
        idx: i,
      };
    });
  }, [valid, cx, cy]);

  // Auto-fit: zoom to show ~first 50km so center is prominent
  useEffect(() => {
    if (!containerRef.current || valid.length === 0) return;
    const w = containerRef.current.clientWidth;
    const fitDist = Math.min(maxDist, 50);
    const fitPx = fitDist * PX_PER_KM * 2 + 60;
    setZoom(Math.min(Math.max(w / fitPx, 0.5), 5));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid.length]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(z * (e.deltaY > 0 ? 0.9 : 1.1), 0.05), 20));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX, y: e.touches[0].clientY,
        panX: pan.x, panY: pan.y,
      };
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging || e.touches.length !== 1) return;
    setPan({
      x: dragStart.current.panX + (e.touches[0].clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.touches[0].clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", prevent, { passive: false });
    return () => el.removeEventListener("wheel", prevent);
  }, []);

  // Determine which ring labels to show based on zoom
  const labelEvery = zoom < 0.3 ? KM_PER_RING * 10 : zoom < 0.8 ? KM_PER_RING * 5 : zoom < 2 ? KM_PER_RING * 2 : KM_PER_RING;
  const ringEvery = zoom < 0.3 ? 5 : zoom < 0.8 ? 2 : 1;

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.4, 20))}
          className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white/60 text-sm font-medium transition-colors flex items-center justify-center"
        >+</button>
        <button
          onClick={() => setZoom((z) => Math.max(z * 0.7, 0.05))}
          className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white/60 text-sm font-medium transition-colors flex items-center justify-center"
        >−</button>
        <button
          onClick={handleReset}
          className="h-7 px-2 rounded-md bg-white/10 hover:bg-white/20 text-white/50 text-[10px] font-medium transition-colors"
        >Reset</button>
      </div>

      <div className="absolute bottom-3 left-3 z-10 text-[10px] text-white/25">
        Arrastra para mover · Scroll para zoom · Pasa el ratón sobre un punto
      </div>

      <div
        ref={containerRef}
        className="w-full aspect-[2/1] bg-foreground rounded-2xl overflow-hidden select-none"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { handleMouseUp(); setHovered(null); }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
          <pattern id="rdots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#rdots)" />
        </svg>

        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            transform={`translate(${pan.x / zoom}, ${pan.y / zoom}) scale(${zoom})`}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transition: dragging ? "none" : "transform 0.1s ease-out",
            }}
          >
            {/* Rings */}
            {rings.map((km, i) => {
              if ((i + 1) % ringEvery !== 0) return null;
              const r = km * PX_PER_KM;
              const isMajor = km % (KM_PER_RING * 5) === 0;
              return (
                <g key={km}>
                  <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke="white"
                    strokeOpacity={isMajor ? 0.2 : 0.08}
                    strokeWidth={isMajor ? 1.5 : 0.8}
                  />
                  {km % labelEvery === 0 && (
                    <text
                      x={cx + r + 3} y={cy - 3}
                      fill="white" fillOpacity={0.45}
                      fontSize={9 / zoom}
                      fontWeight={500}
                    >
                      {km} km
                    </text>
                  )}
                </g>
              );
            })}

            {/* Destination dots — AnimatePresence for smooth enter/exit */}
            <AnimatePresence>
              {points.map((p) => (
                <motion.g
                  key={p.key}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.4 } }}
                  transition={{ duration: 0.3 }}
                  onMouseEnter={() => setHovered(p.idx)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer", transformOrigin: `${p.x}px ${p.y}px` }}
                >
                  {/* Invisible larger hit area */}
                  <circle
                    cx={p.x} cy={p.y}
                    r={Math.max(8, 12 / zoom)}
                    fill="transparent"
                  />
                  {/* Visible dot */}
                  <circle
                    cx={p.x} cy={p.y}
                    r={hovered === p.idx ? Math.max(3, 5 / zoom) : Math.max(1.5, 2.5 / zoom)}
                    fill="white"
                    fillOpacity={hovered === p.idx ? 0.9 : 0.5}
                    style={{ transition: "all 0.15s ease" }}
                  />
                  {/* Label — only on hover */}
                  {hovered === p.idx && (
                    <g>
                      <rect
                        x={p.x + 10 / zoom}
                        y={p.y - 16 / zoom}
                        width={Math.max(80, (p.municipio.length * 6.5 + 20)) / zoom}
                        height={28 / zoom}
                        rx={4 / zoom}
                        fill="white"
                        fillOpacity={0.12}
                      />
                      <text
                        x={p.x + 16 / zoom}
                        y={p.y - 4 / zoom}
                        fill="white"
                        fillOpacity={0.95}
                        fontSize={11 / zoom}
                        fontWeight={600}
                      >
                        {p.municipio}
                      </text>
                      <text
                        x={p.x + 16 / zoom}
                        y={p.y + 8 / zoom}
                        fill="white"
                        fillOpacity={0.5}
                        fontSize={9 / zoom}
                      >
                        {p.distancia} km
                      </text>
                    </g>
                  )}
                </motion.g>
              ))}
            </AnimatePresence>

            {/* Center */}
            <circle cx={cx} cy={cy} r={16 / zoom} fill="white" fillOpacity={0.1} />
            <text
              x={cx} y={cy + 1}
              fill="white" fillOpacity={0.9}
              fontSize={11 / zoom}
              fontWeight={600}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {origen}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
