import { area, bearing, booleanIntersects, buffer, distance, point } from '@turf/turf'
import type { Feature, GeoJsonProperties, Point, Polygon } from 'geojson'
import type { Cardinal, Coordinates, NearbyItem } from '../types/gis'

export type ValidationResult =
  | { ok: true; value: Coordinates }
  | { ok: false; errors: { lat?: string; lon?: string } }

/** Valida latitud [-90, 90] y longitud [-180, 180]. Acepta números o texto (admite coma decimal). */
export function validateCoordinates(latInput: string | number, lonInput: string | number): ValidationResult {
  const parse = (v: string | number) => (typeof v === 'number' ? v : v.trim() === '' ? NaN : Number(v.trim().replace(',', '.')))
  const lat = parse(latInput)
  const lon = parse(lonInput)
  const errors: { lat?: string; lon?: string } = {}
  if (!Number.isFinite(lat)) errors.lat = 'Latitud no es un número válido'
  else if (lat < -90 || lat > 90) errors.lat = 'Latitud debe estar entre -90 y 90'
  if (!Number.isFinite(lon)) errors.lon = 'Longitud no es un número válido'
  else if (lon < -180 || lon > 180) errors.lon = 'Longitud debe estar entre -180 y 180'
  if (errors.lat || errors.lon) return { ok: false, errors }
  return { ok: true, value: { lat, lon } }
}

function toDms(value: number, pos: string, neg: string): string {
  const abs = Math.abs(value)
  let deg = Math.floor(abs)
  let min = Math.floor((abs - deg) * 60)
  let sec = Math.round(((abs - deg) * 60 - min) * 60 * 100) / 100
  if (sec >= 60) {
    sec = 0
    min += 1
  }
  if (min >= 60) {
    min = 0
    deg += 1
  }
  const hemi = value < 0 ? neg : pos
  return `${deg}°${String(min).padStart(2, '0')}′${sec.toFixed(2).padStart(5, '0')}″ ${hemi}`
}

/** Convierte coordenadas decimales a grados, minutos y segundos. */
export function toDMS({ lat, lon }: Coordinates): { lat: string; lon: string } {
  return { lat: toDms(lat, 'N', 'S'), lon: toDms(lon, 'E', 'O') }
}

const toPoint = ({ lat, lon }: Coordinates) => point([lon, lat])

/** Distancia geodésica en kilómetros. */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  return distance(toPoint(a), toPoint(b), { units: 'kilometers' })
}

/** Rumbo inicial de a hacia b, en grados [0, 360). */
export function initialBearing(a: Coordinates, b: Coordinates): number {
  const deg = bearing(toPoint(a), toPoint(b))
  return (deg + 360) % 360
}

const CARDINALS: Cardinal[] = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']

/** Convierte un rumbo en grados a punto cardinal de 8 sectores. */
export function bearingToCardinal(deg: number): Cardinal {
  const norm = ((deg % 360) + 360) % 360
  return CARDINALS[Math.round(norm / 45) % 8]
}

const coordsOf = (f: Feature<Point>): Coordinates => ({
  lon: f.geometry.coordinates[0],
  lat: f.geometry.coordinates[1],
})

/** Enriquece entidades puntuales con distancia, rumbo y cardinal desde un origen; ordenadas por distancia. */
export function measureFeatures<P extends { name: string }>(
  origin: Coordinates,
  features: Feature<Point, P>[],
): NearbyItem<P>[] {
  return features
    .map((feature) => {
      const target = coordsOf(feature)
      const bearingDeg = initialBearing(origin, target)
      return {
        feature,
        distanceKm: distanceKm(origin, target),
        bearingDeg,
        cardinal: bearingToCardinal(bearingDeg),
      }
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

/** Entidades dentro de maxKm (inclusive), ordenadas por distancia. */
export function selectWithinDistance<P extends { name: string }>(
  origin: Coordinates,
  features: Feature<Point, P>[],
  maxKm: number,
): NearbyItem<P>[] {
  return measureFeatures(origin, features).filter((i) => i.distanceKm <= maxKm)
}

/** Las n entidades más cercanas (por defecto 4). */
export function selectNearest<P extends { name: string }>(
  origin: Coordinates,
  features: Feature<Point, P>[],
  n = 4,
): NearbyItem<P>[] {
  return measureFeatures(origin, features).slice(0, n)
}

/** Buffer circular (polígono) alrededor de un punto. */
export function makeBuffer(origin: Coordinates, radiusKm: number): Feature<Polygon> {
  return buffer(toPoint(origin), radiusKm, { units: 'kilometers', steps: 64 }) as Feature<Polygon>
}

/** Superficie en hectáreas de un polígono. */
export function areaHectares(poly: Feature<Polygon>): number {
  return area(poly) / 10_000
}

/** Zonas cuyo polígono intersecta el buffer dado. */
export function zonesIntersectingBuffer<P extends GeoJsonProperties>(bufferPoly: Feature<Polygon>, zones: Feature<Polygon, P>[]): Feature<Polygon, P>[] {
  return zones.filter((z) => booleanIntersects(bufferPoly, z))
}

