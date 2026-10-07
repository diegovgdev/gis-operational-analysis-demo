import { describe, expect, it } from 'vitest'
import type { Feature, Point, Polygon } from 'geojson'
import {
  bearingToCardinal,
  distanceKm,
  initialBearing,
  makeBuffer,
  selectNearest,
  selectWithinDistance,
  toDMS,
  validateCoordinates,
  zonesIntersectingBuffer,
} from './geo'

const pt = (name: string, lat: number, lon: number): Feature<Point, { name: string }> => ({
  type: 'Feature',
  properties: { name },
  geometry: { type: 'Point', coordinates: [lon, lat] },
})

describe('validateCoordinates', () => {
  it('acepta valores válidos y límites', () => {
    expect(validateCoordinates('39.5', '-106')).toEqual({ ok: true, value: { lat: 39.5, lon: -106 } })
    expect(validateCoordinates(90, 180).ok).toBe(true)
    expect(validateCoordinates(-90, -180).ok).toBe(true)
  })
  it('acepta coma decimal', () => {
    expect(validateCoordinates('10,5', '20,25')).toEqual({ ok: true, value: { lat: 10.5, lon: 20.25 } })
  })
  it('rechaza fuera de rango', () => {
    const r = validateCoordinates(91, 181)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(Object.keys(r.errors)).toEqual(['lat', 'lon'])
  })
  it('rechaza vacío y no numérico', () => {
    expect(validateCoordinates('', 'abc').ok).toBe(false)
  })
})

describe('toDMS', () => {
  it('convierte decimal a GMS con hemisferios', () => {
    expect(toDMS({ lat: 39.5, lon: -106 })).toEqual({ lat: '39°30′00.00″ N', lon: '106°00′00.00″ O' })
    expect(toDMS({ lat: -33.8688, lon: 151.2093 })).toEqual({ lat: '33°52′07.68″ S', lon: '151°12′33.48″ E' })
  })
  it('maneja acarreo por redondeo', () => {
    expect(toDMS({ lat: 10.99999999, lon: 0 }).lat).toBe('11°00′00.00″ N')
  })
})

describe('distancia y rumbo', () => {
  it('1 grado de latitud ≈ 111.19 km', () => {
    expect(distanceKm({ lat: 0, lon: 0 }, { lat: 1, lon: 0 })).toBeCloseTo(111.19, 1)
  })
  it('distancia cero', () => {
    expect(distanceKm({ lat: 5, lon: 5 }, { lat: 5, lon: 5 })).toBe(0)
  })
  it('rumbos en los ejes principales', () => {
    const o = { lat: 0, lon: 0 }
    expect(initialBearing(o, { lat: 1, lon: 0 })).toBeCloseTo(0)
    expect(initialBearing(o, { lat: 0, lon: 1 })).toBeCloseTo(90)
    expect(initialBearing(o, { lat: -1, lon: 0 })).toBeCloseTo(180)
    expect(initialBearing(o, { lat: 0, lon: -1 })).toBeCloseTo(270)
  })
})

describe('bearingToCardinal', () => {
  it.each([
    [0, 'N'], [22, 'N'], [23, 'NE'], [90, 'E'], [135, 'SE'], [180, 'S'],
    [225, 'SO'], [270, 'O'], [315, 'NO'], [337, 'NO'], [338, 'N'], [360, 'N'], [-90, 'O'],
  ])('%s° → %s', (deg, expected) => {
    expect(bearingToCardinal(deg)).toBe(expected)
  })
})

describe('selección por distancia', () => {
  const origin = { lat: 0, lon: 0 }
  const feats = [pt('lejos', 0, 0.5), pt('cerca', 0, 0.01), pt('medio', 0.03, 0)]
  it('filtra y ordena', () => {
    const r = selectWithinDistance(origin, feats, 5)
    expect(r.map((i) => i.feature.properties.name)).toEqual(['cerca', 'medio'])
    expect(r[0].cardinal).toBe('E')
    expect(r[1].cardinal).toBe('N')
  })
  it('devuelve vacío si ninguno está en rango', () => {
    expect(selectWithinDistance(origin, feats, 0.5)).toEqual([])
  })
  it('selectNearest limita a n', () => {
    expect(selectNearest(origin, feats, 2).map((i) => i.feature.properties.name)).toEqual(['cerca', 'medio'])
    expect(selectNearest(origin, feats).length).toBe(3)
  })
})

describe('intersección buffer/zonas', () => {
  const square = (name: string, lon: number, lat: number, size: number): Feature<Polygon, { name: string }> => ({
    type: 'Feature',
    properties: { name },
    geometry: {
      type: 'Polygon',
      coordinates: [[[lon, lat], [lon + size, lat], [lon + size, lat + size], [lon, lat + size], [lon, lat]]],
    },
  })
  it('detecta solapamiento y descarta zonas lejanas', () => {
    const b = makeBuffer({ lat: 0, lon: 0 }, 3)
    const near = square('near', 0.01, 0.01, 0.02)
    const far = square('far', 1, 1, 0.1)
    const inside = square('contiene', -0.5, -0.5, 1)
    const r = zonesIntersectingBuffer(b, [near, far, inside])
    expect(r.map((z) => z.properties.name)).toEqual(['near', 'contiene'])
  })
})
