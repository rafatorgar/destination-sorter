/** Geometría básica y el tipo común a todo lo que se puede situar en el mapa. */

/**
 * Un sitio ya localizado, venga del listado de municipios o del de núcleos de
 * población. Es lo que consume el cálculo de distancias, que no necesita saber
 * de cuál de los dos salió.
 */
export interface Lugar {
  nombre: string;
  /** Nombre legible de la provincia. */
  provincia: string;
  /** Código INE de provincia (dos dígitos). Lo usa la regla de territorios insulares. */
  codigoProvincia: string;
  lat: number;
  lng: number;
}

const RADIO_TIERRA = 6371;

export function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA * Math.asin(Math.sqrt(h));
}
