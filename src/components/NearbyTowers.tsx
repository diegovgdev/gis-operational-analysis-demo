import type { NearbyItem, TowerProps } from '../types/gis'

export function NearbyTowers({ items }: { items: NearbyItem<TowerProps>[] }) {
  return (
    <section className="card">
      <h2>Torres cercanas <small>(≤ 10 km)</small></h2>
      {items.length === 0 ? (
        <p className="empty">No hay torres DEMO dentro de 10 km de este punto.</p>
      ) : (
        <ul className="list">
          {items.map((t) => (
            <li key={t.feature.properties.id}>
              <div>
                <strong>{t.feature.properties.name}</strong>
                <small>{t.feature.properties.elevationM} m s. n. m. (ficticia)</small>
              </div>
              <div className="metrics">
                <span>{t.distanceKm.toFixed(2)} km</span>
                <span className={`status ${t.feature.properties.status === 'Operativa' ? 'ok' : 'warn'}`}>
                  {t.feature.properties.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
