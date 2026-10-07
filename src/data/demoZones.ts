import type { ZoneFeature } from '../types/gis'

type Ring = [number, number][]
const raw: [string, string, Ring][] = [
  ['Zona DEMO 01', 'Reserva', [[-106.03, 39.52], [-105.98, 39.53], [-105.96, 39.5], [-106.0, 39.48], [-106.03, 39.52]]],
  ['Zona DEMO 02', 'Uso mixto', [[-105.95, 39.46], [-105.9, 39.47], [-105.89, 39.43], [-105.94, 39.42], [-105.95, 39.46]]],
  ['Zona DEMO 03', 'Pastizal', [[-106.1, 39.55], [-106.04, 39.57], [-106.02, 39.54], [-106.08, 39.52], [-106.1, 39.55]]],
  ['Zona DEMO 04', 'Bosque', [[-106.08, 39.44], [-106.02, 39.45], [-106.01, 39.4], [-106.07, 39.39], [-106.08, 39.44]]],
  ['Zona DEMO 05', 'Humedal', [[-105.97, 39.58], [-105.91, 39.6], [-105.9, 39.56], [-105.95, 39.55], [-105.97, 39.58]]],
  ['Zona DEMO 06', 'Matorral', [[-105.88, 39.5], [-105.83, 39.51], [-105.82, 39.47], [-105.87, 39.46], [-105.88, 39.5]]],
]

export const demoZones: ZoneFeature[] = raw.map(([name, kind, ring], i) => ({
  type: 'Feature',
  properties: { id: `ZONA-DEMO-${String(i + 1).padStart(2, '0')}`, name, kind },
  geometry: { type: 'Polygon', coordinates: [ring] },
}))
