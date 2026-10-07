import type { BaseProps, NearbyItem } from '../types/gis'

export function NearbyBasesList({ items }: { items: NearbyItem<BaseProps>[] }) {
  return (
    <section className="card">
      <h2>Bases cercanas</h2>
      <ol className="list">
        {items.map((b) => (
          <li key={b.feature.properties.id}>
            <div>
              <strong>{b.feature.properties.name}</strong>
              <small>{b.feature.properties.kind}</small>
            </div>
            <div className="metrics">
              <span>{b.distanceKm.toFixed(2)} km</span>
              <span>{b.bearingDeg.toFixed(0)}° <em className="tag">{b.cardinal}</em></span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
