import type { RouteFeature } from '../types/gis'

const raw: [string, [number, number][]][] = [
  ['Ruta DEMO A', [[-106.1, 39.5], [-106.04, 39.505], [-105.99, 39.5], [-105.93, 39.51], [-105.86, 39.5]]],
  ['Ruta DEMO B', [[-106.0, 39.64], [-105.99, 39.58], [-105.985, 39.52], [-105.99, 39.45], [-105.98, 39.37]]],
  ['Ruta DEMO C', [[-106.09, 39.4], [-106.04, 39.45], [-105.99, 39.48], [-105.94, 39.55], [-105.9, 39.63]]],
  ['Ruta DEMO D', [[-106.12, 39.58], [-106.07, 39.54], [-106.03, 39.51]]],
  ['Ruta DEMO E', [[-105.9, 39.4], [-105.93, 39.44], [-105.97, 39.47], [-106.02, 39.46]]],
]

export const demoRoutes: RouteFeature[] = raw.map(([name, coordinates], i) => ({
  type: 'Feature',
  properties: { id: `RUTA-DEMO-${String(i + 1).padStart(2, '0')}`, name },
  geometry: { type: 'LineString', coordinates },
}))
