import type { IntersectedZone } from '../types/gis'

export function IntersectedZones({ zones }: { zones: IntersectedZone[] }) {
  return (
    <section className="card">
      <h2>Zonas intersectadas <small>(buffer 3 km)</small></h2>
      {zones.length === 0 ? (
        <p className="empty">Ninguna zona DEMO intersecta el buffer de 3 km.</p>
      ) : (
        <ul className="list">
          {zones.map((z) => (
            <li key={z.id}>
              <div>
                <strong>{z.name}</strong>
                <small>{z.kind}</small>
              </div>
              <div className="metrics">
                <span>≈ {Math.round(z.areaHa).toLocaleString('es-CL')} ha</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
