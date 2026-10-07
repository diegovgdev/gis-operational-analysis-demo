import type { NearbyItem, WaterProps } from '../types/gis'

export function NearbyWaterSources({ items }: { items: NearbyItem<WaterProps>[] }) {
  return (
    <section className="card">
      <h2>Fuentes de agua cercanas <small>(≤ 5 km)</small></h2>
      {items.length === 0 ? (
        <p className="empty">No hay fuentes DEMO dentro de 5 km de este punto.</p>
      ) : (
        <ul className="list">
          {items.map((w) => (
            <li key={w.feature.properties.id}>
              <div>
                <strong>{w.feature.properties.name}</strong>
                <small>{w.feature.properties.kind}</small>
              </div>
              <div className="metrics"><span>{w.distanceKm.toFixed(2)} km</span></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
