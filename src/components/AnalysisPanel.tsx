import { toDMS } from '../lib/geo'
import type { AnalysisResult } from '../types/gis'
import { IntersectedZones } from './IntersectedZones'
import { NearbyBasesList } from './NearbyBasesList'
import { NearbyTowers } from './NearbyTowers'
import { NearbyWaterSources } from './NearbyWaterSources'

interface Props {
  analysis: AnalysisResult | null
  onClear: () => void
}

export function AnalysisPanel({ analysis, onClear }: Props) {
  if (!analysis) {
    return (
      <section className="card empty-state">
        <h2>Resultados</h2>
        <p>Ingresa coordenadas, haz clic en el mapa o usa la ubicación de ejemplo para iniciar un análisis.</p>
      </section>
    )
  }
  const dms = toDMS(analysis.point)
  const { counts } = analysis
  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2>Punto analizado</h2>
          <button className="btn danger" onClick={onClear}>Limpiar análisis</button>
        </div>
        <dl className="kv">
          <dt>Identificador</dt><dd className="mono">{analysis.id}</dd>
          <dt>Fecha y hora</dt><dd>{analysis.createdAt}</dd>
          <dt>Decimal</dt><dd className="mono">{analysis.point.lat.toFixed(5)}, {analysis.point.lon.toFixed(5)}</dd>
          <dt>GMS</dt><dd className="mono">{dms.lat}<br />{dms.lon}</dd>
        </dl>
        <div className="radii" aria-label="Elementos dentro de cada radio">
          <div className="radius g"><b>{counts.r1}</b><span>≤ 1 km</span></div>
          <div className="radius a"><b>{counts.r3}</b><span>≤ 3 km</span></div>
          <div className="radius r"><b>{counts.r5}</b><span>≤ 5 km</span></div>
        </div>
        <p className="hint">Elementos DEMO (bases, fuentes y torres) dentro de cada radio.</p>
      </section>
      <NearbyBasesList items={analysis.nearestBases} />
      <NearbyWaterSources items={analysis.waterSources} />
      <NearbyTowers items={analysis.towers} />
      <IntersectedZones zones={analysis.zones} />
    </>
  )
}
