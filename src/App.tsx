import { useMemo, useState } from 'react'
import { AnalysisPanel } from './components/AnalysisPanel'
import { CoordinateForm } from './components/CoordinateForm'
import { LayerControls } from './components/LayerControls'
import { MapView } from './components/MapView'
import { TopBar } from './components/TopBar'
import { EXAMPLE_LOCATION } from './data'
import { runAnalysis } from './lib/analysis'
import type { AnalysisResult, Coordinates, LayerState } from './types/gis'

export default function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [sequence, setSequence] = useState(0)
  const [layers, setLayers] = useState<LayerState>({
    bases: true,
    water: true,
    towers: true,
    zones: true,
    routes: true,
    buffers: true,
  })
  const [panelOpen, setPanelOpen] = useState(true)

  const analyze = (point: Coordinates) => {
    const next = sequence + 1
    setSequence(next)
    setAnalysis(runAnalysis(point, next))
    setPanelOpen(true)
  }

  const formValue = useMemo(() => analysis?.point ?? null, [analysis])

  return (
    <div className="app">
      <TopBar onTogglePanel={() => setPanelOpen((o) => !o)} panelOpen={panelOpen} />
      <div className="workspace">
        <main className="map-area">
          <MapView analysis={analysis} layers={layers} onPick={analyze} />
          <LayerControls layers={layers} onChange={setLayers} />
        </main>
        <aside className={`side ${panelOpen ? 'open' : 'closed'}`} aria-label="Panel de análisis">
          <CoordinateForm value={formValue} onSubmit={analyze} onExample={() => analyze(EXAMPLE_LOCATION)} />
          <AnalysisPanel analysis={analysis} onClear={() => setAnalysis(null)} />
        </aside>
      </div>
    </div>
  )
}
