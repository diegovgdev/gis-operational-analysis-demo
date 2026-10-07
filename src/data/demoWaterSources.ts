import type { WaterFeature } from '../types/gis'

const raw: [string, number, number, string][] = [
  ['Fuente DEMO Norte', 39.5311, -105.9712, 'Lago'],
  ['Fuente DEMO Sur', 39.4602, -105.9944, 'Estanque'],
  ['Fuente DEMO Este', 39.5105, -105.9337, 'Río'],
  ['Fuente DEMO Oeste', 39.4953, -106.0489, 'Pozo'],
  ['Fuente DEMO Cañada', 39.5527, -106.0138, 'Estanque'],
  ['Fuente DEMO Mirador', 39.4328, -106.0207, 'Lago'],
  ['Fuente DEMO Vega', 39.4788, -105.8872, 'Río'],
  ['Fuente DEMO Alerce', 39.5864, -106.1019, 'Pozo'],
  ['Fuente DEMO Cascada', 39.5019, -106.1127, 'Río'],
  ['Fuente DEMO Laguna', 39.3774, -105.9312, 'Lago'],
  ['Fuente DEMO Roble', 39.6205, -105.9437, 'Estanque'],
  ['Fuente DEMO Pampa', 39.4101, -105.8579, 'Pozo'],
  ['Fuente DEMO Cumbre', 39.5649, -105.8801, 'Estanque'],
  ['Fuente DEMO Bahía', 39.3449, -106.0533, 'Lago'],
  ['Fuente DEMO Ribera', 39.6528, -106.0126, 'Río'],
]

export const demoWaterSources: WaterFeature[] = raw.map(([name, lat, lon, kind], i) => ({
  type: 'Feature',
  properties: { id: `AGUA-DEMO-${String(i + 1).padStart(2, '0')}`, name, kind },
  geometry: { type: 'Point', coordinates: [lon, lat] },
}))
