"use client";

import { useEffect, useMemo, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface Destino {
  municipio: string;
  distancia: number;
  coords?: { lat: number; lng: number } | null;
}

interface ResultsMapProps {
  origen: string;
  origenCoords?: { lat: number; lng: number } | null;
  destinos: Destino[];
}

export default function ResultsMap({ origen, origenCoords, destinos }: ResultsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  const destinosConCoords = useMemo(
    () => destinos.filter((d) => d.coords && d.distancia !== Infinity),
    [destinos]
  );

  const maxDist = useMemo(() => {
    if (destinosConCoords.length === 0) return 1;
    return Math.max(...destinosConCoords.map((d) => d.distancia));
  }, [destinosConCoords]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) {
      (mapInstanceRef.current as { remove: () => void }).remove();
      mapInstanceRef.current = null;
    }

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      const center: [number, number] = origenCoords
        ? [origenCoords.lat, origenCoords.lng]
        : [40.4, -3.7];

      const map = L.map(mapRef.current!, {
        center,
        zoom: 7,
        zoomControl: false,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      const points: [number, number][] = [];

      // Origin marker
      if (origenCoords) {
        const pos: [number, number] = [origenCoords.lat, origenCoords.lng];
        points.push(pos);
        // Pulse ring around origin
        L.circleMarker(pos, {
          radius: 18,
          color: "#000",
          fillColor: "transparent",
          fillOpacity: 0,
          weight: 1.5,
          opacity: 0.25,
          dashArray: "4 4",
        }).addTo(map);

        // Origin marker
        L.circleMarker(pos, {
          radius: 10,
          color: "#000",
          fillColor: "#fff",
          fillOpacity: 1,
          weight: 3,
        })
          .bindPopup(`<strong style="font-size:14px">${origen}</strong><br><span style="color:#888;font-size:12px">Tu municipio de referencia</span>`)
          .openPopup()
          .addTo(map);
      }

      // Destination markers
      destinosConCoords.forEach((d) => {
        if (!d.coords) return;
        const pos: [number, number] = [d.coords.lat, d.coords.lng];
        points.push(pos);
        const opacity = 0.3 + 0.7 * (1 - d.distancia / maxDist);
        const radius = 3 + 5 * (1 - d.distancia / maxDist);

        L.circleMarker(pos, {
          radius,
          color: "#555",
          fillColor: "#333",
          fillOpacity: opacity,
          weight: 1,
        })
          .bindPopup(`<strong>${d.municipio}</strong><br><span style="color:#888;font-size:12px">${d.distancia} km</span>`)
          .addTo(map);
      });

      // Fit bounds
      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!origenCoords && destinosConCoords.length === 0) return null;

  return (
    <div
      ref={mapRef}
      className="rounded-2xl overflow-hidden border border-border bg-[#f8f8f8]"
      style={{ height: 450 }}
    />
  );
}
