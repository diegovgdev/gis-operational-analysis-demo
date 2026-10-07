import type { TowerFeature, TowerProps } from '../types/gis'

const raw: [string, number, number, number, TowerProps['status']][] = [
  ['Torre DEMO Sierra', 39.5173, -106.0236, 2140, 'Operativa'],
  ['Torre DEMO Mesa', 39.4812, -105.9553, 1985, 'En revisión'],
  ['Torre DEMO Pico', 39.5586, -105.9201, 2410, 'Operativa'],
  ['Torre DEMO Cerro', 39.4234, -106.0714, 2275, 'Operativa'],
  ['Torre DEMO Loma', 39.6012, -106.0903, 2050, 'En revisión'],
  ['Torre DEMO Filo', 39.3918, -105.9047, 2330, 'Operativa'],
  ['Torre DEMO Aguja', 39.4571, -105.8512, 2495, 'Operativa'],
  ['Torre DEMO Risco', 39.6397, -105.9744, 2180, 'En revisión'],
]

export const demoTowers: TowerFeature[] = raw.map(([name, lat, lon, elevationM, status], i) => ({
  type: 'Feature',
  properties: { id: `TORRE-DEMO-${String(i + 1).padStart(2, '0')}`, name, elevationM, status },
  geometry: { type: 'Point', coordinates: [lon, lat] },
}))
