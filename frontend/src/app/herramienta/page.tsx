"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ResultsRadar from "@/components/ResultsRadar";
import dynamic from "next/dynamic";

const ResultsMap = dynamic(() => import("@/components/ResultsMap"), { ssr: false });

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface Destino {
  municipio: string;
  provincia: string;
  distancia: number;
  data: Record<string, unknown>;
  coords?: { lat: number; lng: number } | null;
}

export default function Herramienta() {
  const [municipio, setMunicipio] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [origen, setOrigen] = useState("");
  const [columnas, setColumnas] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState<"form" | "results">("form");
  const [busqueda, setBusqueda] = useState("");
  const [origenCoords, setOrigenCoords] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const archivoRef = useRef<File | null>(null);
  const municipioRef = useRef("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo || !municipio) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    archivoRef.current = archivo;
    municipioRef.current = municipio;
    setLoading(true);
    setError("");
    setDestinos([]);
    setDone(false);
    setPhase("results");

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("municipio_referencia", municipio);

    try {
      const res = await fetch(`${BACKEND_URL}/api/procesar`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Error al procesar el archivo.");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No se pudo leer la respuesta.");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);

          if (event.type === "start") {
            setOrigen(event.origen);
            setTotal(event.total);
            setColumnas(event.columnas || []);
            if (event.origen_coords) setOrigenCoords(event.origen_coords);
          } else if (event.type === "destino") {
            setDestinos((prev) => [
              ...prev,
              {
                municipio: event.municipio,
                provincia: event.provincia,
                distancia: event.distancia ?? Infinity,
                data: event.data || {},
                coords: event.coords || null,
              },
            ]);
          } else if (event.type === "done") {
            setDone(true);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
      if (destinos.length === 0) setPhase("form");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (sortedDestinos.length === 0 && destinosFallidos.length === 0) return;

    const allCols = [...columnas, "Distancia (km)"];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const header = allCols.map(escape).join(",");
    const allForCsv = [...sortedDestinos, ...destinosFallidos];
    const rows = allForCsv.map((d) =>
      allCols.map((col) => {
        if (col === "Distancia (km)") return d.distancia === Infinity ? "Sin ruta" : String(d.distancia);
        return escape(d.data[col] ?? "");
      }).join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `destinos_desde_${origen}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setPhase("form");
    setDestinos([]);
    setDone(false);
    setOrigen("");
    setTotal(0);
    setError("");
    setBusqueda("");
    setOrigenCoords(null);
  };

  const destinosFallidos = destinos.filter((d) => d.distancia === Infinity);
  const destinosValidos = [...destinos].filter((d) => d.distancia !== Infinity).sort((a, b) => a.distancia - b.distancia);
  const sortedDestinos = destinosValidos;
  const filteredDestinos = busqueda
    ? destinosValidos.filter((d) =>
        d.municipio.toLowerCase().includes(busqueda.toLowerCase())
      )
    : destinosValidos;

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-muted/40 to-background min-h-[80vh]">
      <AnimatePresence mode="wait">
        {phase === "form" && (
          <motion.div
            key="form"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-lg mx-auto"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                Ordenar destinos por distancia
              </h1>
              <p className="text-muted-foreground mb-8">
                Sube tu Excel con las plazas, indica tu municipio y obtén el
                listado ordenado por distancia.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Datos de entrada</CardTitle>
                  <CardDescription>
                    Rellena los campos y sube tu archivo para procesarlo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="municipio">Municipio de referencia</Label>
                      <Input
                        id="municipio"
                        type="text"
                        placeholder="Ej: Montilla"
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Archivo Excel (.xlsx)</Label>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-foreground/30 hover:bg-muted/50 transition-all duration-200"
                      >
                        {archivo ? (
                          <div>
                            <p className="text-foreground font-medium">
                              {archivo.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Haz clic para cambiar el archivo
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="text-3xl mb-2 text-muted-foreground/50">+</div>
                            <p className="text-muted-foreground text-sm">
                              Haz clic para seleccionar un archivo Excel
                            </p>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx,.xls"
                          className="hidden"
                          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                        />
                      </motion.div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg"
                      >
                        {error}
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 text-base rounded-xl bg-foreground text-background hover:bg-foreground/90"
                    >
                      Procesar
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {phase === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {done ? "Resultados" : "Procesando..."}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {destinos.length} de {total} destinos desde{" "}
                  <span className="font-medium text-foreground">{origen}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {done && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      Nueva consulta
                    </Button>
                    <a
                      href="https://ko-fi.com/rafatorresgarcia"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#8B6914]/40 text-[#6F4E37] bg-[#D2B48C]/30 hover:bg-[#D2B48C]/45 gap-1.5"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="w-4 h-4"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                          <line x1="6" y1="1" x2="6" y2="4" />
                          <line x1="10" y1="1" x2="10" y2="4" />
                          <line x1="14" y1="1" x2="14" y2="4" />
                        </svg>
                        Invítame a un café
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      onClick={handleDownload}
                      className="bg-foreground text-background hover:bg-foreground/90"
                    >
                      Descargar CSV
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Progress bar while loading */}
            {loading && total > 0 && (
              <div className="mb-6">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-foreground rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(destinos.length / total) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Live log while processing */}
            {loading && destinos.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 bg-foreground rounded-xl p-4 max-h-48 overflow-y-auto font-mono text-xs"
              >
                {destinos.slice(-8).map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-white/50 py-0.5"
                  >
                    <span className="text-white/30">[{destinos.length - (7 - i) > 0 ? destinos.length - (7 - i) : i + 1}/{total}]</span>{" "}
                    {d.municipio}{" "}
                    <span className="text-white/70">
                      {d.distancia === Infinity ? "—" : `${d.distancia} km`}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Visual radar — only when done */}
            {done && destinos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <ResultsRadar origen={origen} destinos={sortedDestinos} />
              </motion.div>
            )}

            {/* Map — show when done */}
            {done && destinos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8"
              >
                <ResultsMap
                  origen={origen}
                  origenCoords={origenCoords}
                  destinos={sortedDestinos}
                />
              </motion.div>
            )}

            {/* Table — show when done */}
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Destinos ordenados ({filteredDestinos.length})
                  </h3>
                  <Input
                    type="text"
                    placeholder="Buscar municipio..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                <Card className="glass overflow-x-auto">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">km</TableHead>
                          <TableHead>Municipio</TableHead>
                          {columnas.filter((c) => c !== "MUNICIPIO").map((col) => (
                            <TableHead key={col}>{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDestinos.map((dest, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(i * 0.02, 2), duration: 0.2 }}
                            className="border-b border-border/50"
                          >
                            <TableCell className="tabular-nums font-semibold">
                              {dest.distancia}
                            </TableCell>
                            <TableCell className="font-medium">
                              {dest.data["MUNICIPIO"] != null ? String(dest.data["MUNICIPIO"]) : dest.municipio}
                            </TableCell>
                            {columnas.filter((c) => c !== "MUNICIPIO").map((col) => (
                              <TableCell
                                key={col}
                                className="text-muted-foreground"
                              >
                                {dest.data[col] != null ? String(dest.data[col]) : ""}
                              </TableCell>
                            ))}
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Failed destinations — separate section */}
            {done && destinosFallidos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8"
              >
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Destinos sin ruta disponible ({destinosFallidos.length})
                </h3>
                <Card className="glass">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-4">
                      Google Maps no pudo calcular la distancia en coche a estos municipios. Esto suele ocurrir con destinos insulares (Baleares, Canarias, Ceuta, Melilla) o direcciones no reconocidas.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {destinosFallidos.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-dashed border-border bg-muted/30"
                        >
                          <span className="text-muted-foreground/50">—</span>
                          <div>
                            <span className="font-medium text-foreground">{d.municipio}</span>
                            {d.provincia && (
                              <span className="text-muted-foreground ml-1 text-xs">({d.provincia})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
