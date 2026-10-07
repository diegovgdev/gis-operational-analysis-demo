import type { Feature, FeatureCollection, LineString, Point, Polygon } from 'geojson'
import { demoBases, demoTowers, demoWaterSources, demoZones } from '../data'
import type { AnalysisResult, Coordinates } from '../types/gis'
import { areaHectares, makeBuffer, selectNearest, selectWithinDistance, zonesIntersectingBuffer } from './geo'

export const RADII_KM = { r1: 1, r3: 3, r5: 5 } as const
export const WATER_RADIUS_KM = 5
export const TOWER_RADIUS_KM = 10

export function analysisId(sequence: number): string {
  return `ANL-DEMO-${String(sequence).padStart(3, '0')}`
}

/** Ejecuta el análisis espacial completo para un punto. */
export function runAnalysis(point: Coordinates, sequence: number, now: Date = new Date()): AnalysisResult {
  const elements: Feature<Point, { name: string }>[] = [...demoBases, ...demoWaterSources, ...demoTowers]
  const all = (km: number) => selectWithinDistance(point, elements, km).length
  const buffer3 = makeBuffer(point, RADII_KM.r3)

  return {
    id: analysisId(sequence),
    createdAt: now.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'medium' }),
    point,
    nearestBases: selectNearest(point, demoBases, 4),
    counts: { r1: all(RADII_KM.r1), r3: all(RADII_KM.r3), r5: all(RADII_KM.r5) },
    waterSources: selectWithinDistance(point, demoWaterSources, WATER_RADIUS_KM),
    towers: selectWithinDistance(point, demoTowers, TOWER_RADIUS_KM),
    zones: zonesIntersectingBuffer(buffer3, demoZones).map((z) => ({
      id: z.properties.id,
      name: z.properties.name,
      kind: z.properties.kind,
      areaHa: areaHectares(z),
    })),
  }
}

/** Geometrías de visualización derivadas del análisis (buffers y líneas a bases). */
export function buildOverlays(result: AnalysisResult): {
  buffers: FeatureCollection<Polygon>
  links: FeatureCollection<LineString>
} {
  const buffers: Feature<Polygon>[] = (['r5', 'r3', 'r1'] as const).map((key) => {
    const b = makeBuffer(result.point, RADII_KM[key])
    b.properties = { radius: key }
    return b
  })
  const links: Feature<LineString>[] = result.nearestBases.map((b) => ({
    type: 'Feature',
    properties: { name: b.feature.properties.name },
    geometry: {
      type: 'LineString',
      coordinates: [[result.point.lon, result.point.lat], b.feature.geometry.coordinates],
    },
  }))
  return {
    buffers: { type: 'FeatureCollection', features: buffers },
    links: { type: 'FeatureCollection', features: links },
  }
}

