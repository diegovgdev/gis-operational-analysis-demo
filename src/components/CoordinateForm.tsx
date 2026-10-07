import { useEffect, useState, type FormEvent } from 'react'
import { validateCoordinates } from '../lib/geo'
import type { Coordinates } from '../types/gis'

interface Props {
  value: Coordinates | null
  onSubmit: (c: Coordinates) => void
  onExample: () => void
}

export function CoordinateForm({ value, onSubmit, onExample }: Props) {
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [errors, setErrors] = useState<{ lat?: string; lon?: string }>({})

  // Sincroniza el formulario cuando el punto cambia (clic en mapa o ejemplo).
  useEffect(() => {
    if (value) {
      setLat(value.lat.toFixed(5))
      setLon(value.lon.toFixed(5))
      setErrors({})
    }
  }, [value])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const r = validateCoordinates(lat, lon)
    if (r.ok) {
      setErrors({})
      onSubmit(r.value)
    } else setErrors(r.errors)
  }

  return (
    <section className="card">
      <h2>Punto de análisis</h2>
      <form onSubmit={submit} noValidate>
        <div className="fields">
          <label>
            Latitud
            <input
              inputMode="decimal"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="-90 a 90"
              aria-invalid={!!errors.lat}
              aria-describedby="lat-err"
            />
            <span id="lat-err" className="err" role="alert">{errors.lat}</span>
          </label>
          <label>
            Longitud
            <input
              inputMode="decimal"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="-180 a 180"
              aria-invalid={!!errors.lon}
              aria-describedby="lon-err"
            />
            <span id="lon-err" className="err" role="alert">{errors.lon}</span>
          </label>
        </div>
        <div className="actions">
          <button type="submit" className="btn primary">Analizar</button>
          <button type="button" className="btn" onClick={onExample}>Usar ubicación de ejemplo</button>
        </div>
        <p className="hint">También puedes hacer clic sobre el mapa.</p>
      </form>
    </section>
  )
}
