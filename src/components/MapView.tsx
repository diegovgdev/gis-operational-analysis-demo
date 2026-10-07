import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { GeoJSONSource, Map as MlMap } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { bbox } from '@turf/turf'
import type { FeatureCollection } from 'geojson'
import { demoBases, demoRoutes, demoTowers, demoWaterSources, demoZones, MAP_CENTER } from '../data'
import { buildOverlays } from '../lib/analysis'
import type { AnalysisResult, Coordinates, LayerState } from '../types/gis'

// Estilo público sin token (OpenFreeMap). Se oscurece en cliente para el tema grafito.
maplibregl.setWorkerUrl(workerUrl)

const BASE_STYLE = 'https://tiles.openfreemap.org/styles/positron'

const fc = (features: unknown[]) => ({ type: 'FeatureCollection', features }) as FeatureCollection
const EMPTY: FeatureCollection = fc([])

const LAYER_GROUPS: Record<keyof LayerState, string[]> = {
  bases: ['demo-bases'],
  water: ['demo-water'],
  towers: ['demo-towers'],
  zones: ['demo-zones-fill', 'demo-zones-line'],
  routes: ['demo-routes'],
  buffers: ['buffers-fill', 'buffers-line', 'links-line'],
}

let colorCtx: CanvasRenderingContext2D | null = null
function darken(value: unknown, kind: 'surface' | 'text'): unknown {
  if (Array.isArray(value)) return value.map((v) => darken(v, kind))
  if (typeof value !== 'string' || !/^(#|rgb|hsl)/i.test(value)) return value
  colorCtx ??= document.createElement('canvas').getContext('2d')
  if (!colorCtx) return value
  colorCtx.fillStyle = '#000'
  colorCtx.fillStyle = value
  const hex = colorCtx.fillStyle
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!m) return value
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const nl = kind === 'text' ? 0.5 + (1 - l) * 0.4 : 0.07 + (1 - l) * 0.13
  return `hsl(${h.toFixed(0)}, ${(s * 45).toFixed(0)}%, ${(nl * 100).toFixed(1)}%)`
}

function applyDarkTheme(map: MlMap) {
  const props: [string, 'surface' | 'text', 'paint'][] = [
    ['background-color', 'surface', 'paint'],
    ['fill-color', 'surface', 'paint'],
    ['line-color', 'surface', 'paint'],
    ['text-color', 'text', 'paint'],
    ['text-halo-color', 'surface', 'paint'],
  ]
  for (const layer of map.getStyle().layers) {
    for (const [prop, kind] of props) {
      try {
        const current = map.getPaintProperty(layer.id, prop as 'fill-color')
        if (current === undefined) continue
        map.setPaintProperty(layer.id, prop as 'fill-color', darken(current, kind) as string)
      } catch {
        /* expresión no soportada: se deja el valor original */
      }
    }
  }
}

interface Props {
  analysis: AnalysisResult | null
  layers: LayerState
  onPick: (c: Coordinates) => void
}

export function MapView({ analysis, layers, onPick }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MlMap | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const pickRef = useRef(onPick)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    pickRef.current = onPick
  }, [onPick])

  useEffect(() => {
    if (!container.current) return
    const map = new maplibregl.Map({
      container: container.current,
      style: BASE_STYLE,
      center: MAP_CENTER,
      zoom: 9.6,
      attributionControl: { compact: false },
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

    map.on('error', (e) => {
      if (!map.isStyleLoaded()) setLoadError(true)
      console.warn('Map error', e.error?.message)
    })

    map.on('load', () => {
      applyDarkTheme(map)
      const add = (id: string, data: FeatureCollection) => map.addSource(id, { type: 'geojson', data })
      add('zones', fc(demoZones))
      add('routes', fc(demoRoutes))
      add('bases', fc(demoBases))
      add('water', fc(demoWaterSources))
      add('towers', fc(demoTowers))
      add('buffers', EMPTY)
      add('links', EMPTY)

      map.addLayer({ id: 'demo-zones-fill', type: 'fill', source: 'zones', paint: { 'fill-color': '#34d399', 'fill-opacity': 0.14 } })
      map.addLayer({ id: 'demo-zones-line', type: 'line', source: 'zones', paint: { 'line-color': '#34d399', 'line-width': 1.5, 'line-dasharray': [2, 1] } })
      map.addLayer({
        id: 'buffers-fill', type: 'fill', source: 'buffers',
        paint: {
          'fill-color': ['match', ['get', 'radius'], 'r1', '#22c55e', 'r3', '#f59e0b', '#ef4444'],
          'fill-opacity': 0.12,
        },
      })
      map.addLayer({
        id: 'buffers-line', type: 'line', source: 'buffers',
        paint: {
          'line-color': ['match', ['get', 'radius'], 'r1', '#22c55e', 'r3', '#f59e0b', '#ef4444'],
          'line-width': 2,
        },
      })
      map.addLayer({ id: 'demo-routes', type: 'line', source: 'routes', paint: { 'line-color': '#e2e8f0', 'line-width': 2, 'line-opacity': 0.7 } })
      map.addLayer({ id: 'links-line', type: 'line', source: 'links', paint: { 'line-color': '#22d3ee', 'line-width': 2, 'line-dasharray': [1.5, 1.5] } })
      const circle = (id: string, source: string, color: string, radius: number) =>
        map.addLayer({
          id, type: 'circle', source,
          paint: { 'circle-radius': radius, 'circle-color': color, 'circle-stroke-color': '#0b0f14', 'circle-stroke-width': 1.5 },
        })
      circle('demo-water', 'water', '#3b82f6', 5)
      circle('demo-towers', 'towers', '#c084fc', 6)
      circle('demo-bases', 'bases', '#22d3ee', 7)

      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
      for (const id of ['demo-bases', 'demo-water', 'demo-towers', 'demo-zones-fill', 'demo-routes']) {
        map.on('mousemove', id, (e) => {
          const f = e.features?.[0]
          if (!f) return
          map.getCanvas().style.cursor = 'pointer'
          popup.setLngLat(e.lngLat).setText(String(f.properties?.name ?? '')).addTo(map)
        })
        map.on('mouseleave', id, () => {
          map.getCanvas().style.cursor = ''
          popup.remove()
        })
      }

      map.on('click', (e) => pickRef.current({ lat: e.lngLat.lat, lon: ((e.lngLat.lng + 540) % 360) - 180 }))
      setReady(true)
    })

    return () => {
      markerRef.current?.remove()
      map.remove()
      mapRef.current = null
      setReady(false)
    }
  }, [])

  // Visibilidad de capas
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    for (const key of Object.keys(LAYER_GROUPS) as (keyof LayerState)[]) {
      for (const id of LAYER_GROUPS[key]) map.setLayoutProperty(id, 'visibility', layers[key] ? 'visible' : 'none')
    }
  }, [layers, ready])

  // Resultado de análisis: overlays, marcador y encuadre
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    markerRef.current?.remove()
    markerRef.current = null
    if (!analysis) {
      ;(map.getSource('buffers') as GeoJSONSource).setData(EMPTY)
      ;(map.getSource('links') as GeoJSONSource).setData(EMPTY)
      return
    }
    const { buffers, links } = buildOverlays(analysis)
    ;(map.getSource('buffers') as GeoJSONSource).setData(buffers)
    ;(map.getSource('links') as GeoJSONSource).setData(links)

    const el = document.createElement('div')
    el.className = 'analysis-marker'
    el.setAttribute('aria-label', `Punto analizado ${analysis.id}`)
    markerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([analysis.point.lon, analysis.point.lat])
      .addTo(map)

    const [w, s, e, n] = bbox(buffers.features[0])
    map.fitBounds([[w, s], [e, n]], { padding: 48, duration: 800, maxZoom: 13 })
  }, [analysis, ready])

  return (
    <div className="map-wrap">
      <div ref={container} className="map" role="application" aria-label="Mapa interactivo" />
      {loadError && (
        <div className="map-error" role="status">
          No se pudo cargar el mapa base (requiere conexión). Las capas DEMO y el análisis siguen disponibles.
        </div>
      )}
    </div>
  )
}

