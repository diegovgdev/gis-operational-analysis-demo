import type { BaseFeature } from '../types/gis'

const raw: [string, number, number, string][] = [
  ['Base DEMO Alfa', 39.5042, -105.9871, 'Principal'],
  ['Base DEMO Bravo', 39.5388, -106.0415, 'Avanzada'],
  ['Base DEMO Charlie', 39.4631, -106.0522, 'Apoyo'],
  ['Base DEMO Delta', 39.4719, -105.9304, 'Avanzada'],
  ['Base DEMO Eco', 39.5714, -105.9582, 'Apoyo'],
  ['Base DEMO Foxtrot', 39.4127, -105.9876, 'Principal'],
  ['Base DEMO Golf', 39.5265, -106.1348, 'Avanzada'],
  ['Base DEMO Hotel', 39.6103, -106.0711, 'Apoyo'],
  ['Base DEMO India', 39.3892, -106.1103, 'Avanzada'],
  ['Base DEMO Juliett', 39.6431, -105.8894, 'Principal'],
  ['Base DEMO Kilo', 39.3566, -105.8827, 'Apoyo'],
  ['Base DEMO Lima', 39.4458, -105.8431, 'Avanzada'],
]

export const demoBases: BaseFeature[] = raw.map(([name, lat, lon, kind], i) => ({
  type: 'Feature',
  properties: { id: `BASE-DEMO-${String(i + 1).padStart(2, '0')}`, name, kind },
  geometry: { type: 'Point', coordinates: [lon, lat] },
}))
