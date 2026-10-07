import type { LayerState } from '../types/gis'

interface Props {
  layers: LayerState
  onChange: (l: LayerState) => void
}

const ITEMS: { key: keyof LayerState; label: string; color: string }[] = [
  { key: 'bases', label: 'Bases', color: '#22d3ee' },
  { key: 'water', label: 'Fuentes de agua', color: '#3b82f6' },
  { key: 'towers', label: 'Torres', color: '#c084fc' },
  { key: 'zones', label: 'Zonas', color: '#34d399' },
  { key: 'routes', label: 'Rutas', color: '#e2e8f0' },
  { key: 'buffers', label: 'Buffers', color: '#f59e0b' },
]

export function LayerControls({ layers, onChange }: Props) {
  return (
    <fieldset className="layers">
      <legend>Capas</legend>
      {ITEMS.map(({ key, label, color }) => (
        <label key={key} className="switch">
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={(e) => onChange({ ...layers, [key]: e.target.checked })}
          />
          <span className="dot" style={{ background: color }} />
          {label}
        </label>
      ))}
    </fieldset>
  )
}
