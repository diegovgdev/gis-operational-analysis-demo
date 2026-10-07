import type { Feature, LineString, Point, Polygon } from 'geojson'

export interface Coordinates {
  lat: number
  lon: number
}

export type BaseProps = { id: string; name: string; kind: string }
export type WaterProps = { id: string; name: string; kind: string }
export type TowerProps = { id: string; name: string; elevationM: number; status: 'Operativa' | 'En revisión' }
export type ZoneProps = { id: string; name: string; kind: string }
export type RouteProps = { id: string; name: string }

export type BaseFeature = Feature<Point, BaseProps>
export type WaterFeature = Feature<Point, WaterProps>
export type TowerFeature = Feature<Point, TowerProps>
export type ZoneFeature = Feature<Polygon, ZoneProps>
export type RouteFeature = Feature<LineString, RouteProps>

export type Cardinal = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SO' | 'O' | 'NO'

export interface NearbyItem<P extends { name: string }> {
  feature: Feature<Point, P>
  distanceKm: number
  bearingDeg: number
  cardinal: Cardinal
}

export interface IntersectedZone {
  id: string
  name: string
  kind: string
  areaHa: number
}

export interface AnalysisResult {
  id: string
  createdAt: string
  point: Coordinates
  nearestBases: NearbyItem<BaseProps>[]
  counts: { r1: number; r3: number; r5: number }
  waterSources: NearbyItem<WaterProps>[]
  towers: NearbyItem<TowerProps>[]
  zones: IntersectedZone[]
}

export interface LayerState {
  bases: boolean
  water: boolean
  towers: boolean
  zones: boolean
  routes: boolean
  buffers: boolean
}
