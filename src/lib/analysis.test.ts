import { describe, expect, it } from 'vitest'
import { demoBases, demoRoutes, demoTowers, demoWaterSources, demoZones, EXAMPLE_LOCATION } from '../data'
import { analysisId, buildOverlays, runAnalysis } from './analysis'

describe('datos DEMO', () => {
  it('tienen las cantidades requeridas', () => {
    expect(demoBases).toHaveLength(12)
    expect(demoWaterSources).toHaveLength(15)
    expect(demoTowers).toHaveLength(8)
    expect(demoZones).toHaveLength(6)
    expect(demoRoutes).toHaveLength(5)
  })
  it('todos los nombres son explícitamente DEMO', () => {
    const all = [...demoBases, ...demoWaterSources, ...demoTowers, ...demoZones, ...demoRoutes]
    expect(all.every((f) => f.properties.name.includes('DEMO'))).toBe(true)
  })
})

describe('runAnalysis', () => {
  const r = runAnalysis(EXAMPLE_LOCATION, 1, new Date('2026-01-01T12:00:00'))

  it('genera identificador secuencial', () => {
    expect(r.id).toBe('ANL-DEMO-001')
    expect(analysisId(12)).toBe('ANL-DEMO-012')
  })
  it('devuelve las 4 bases más cercanas ordenadas', () => {
    expect(r.nearestBases).toHaveLength(4)
    const d = r.nearestBases.map((b) => b.distanceKm)
    expect([...d].sort((a, b) => a - b)).toEqual(d)
    expect(r.nearestBases[0].feature.properties.name).toBe('Base DEMO Alfa')
  })
  it('los conteos son monótonos y consistentes', () => {
    expect(r.counts.r1).toBeLessThanOrEqual(r.counts.r3)
    expect(r.counts.r3).toBeLessThanOrEqual(r.counts.r5)
    expect(r.counts.r5).toBeGreaterThan(0)
  })
  it('respeta radios de agua (5 km) y torres (10 km)', () => {
    expect(r.waterSources.every((w) => w.distanceKm <= 5)).toBe(true)
    expect(r.towers.every((t) => t.distanceKm <= 10)).toBe(true)
  })
  it('detecta zonas intersectadas con área positiva', () => {
    expect(r.zones.length).toBeGreaterThan(0)
    expect(r.zones.every((z) => z.areaHa > 0)).toBe(true)
  })
  it('un punto lejano no tiene fuentes ni zonas', () => {
    const far = runAnalysis({ lat: -10, lon: 20 }, 2)
    expect(far.waterSources).toEqual([])
    expect(far.zones).toEqual([])
    expect(far.counts).toEqual({ r1: 0, r3: 0, r5: 0 })
    expect(far.nearestBases).toHaveLength(4)
  })
  it('buildOverlays crea 3 buffers y 4 líneas', () => {
    const o = buildOverlays(r)
    expect(o.buffers.features).toHaveLength(3)
    expect(o.links.features).toHaveLength(4)
  })
})
