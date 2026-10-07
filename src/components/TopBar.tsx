interface Props {
  panelOpen: boolean
  onTogglePanel: () => void
}

export function TopBar({ panelOpen, onTogglePanel }: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="16" cy="16" r="4" fill="currentColor" />
        </svg>
        <h1>GIS Operational Analysis Demo</h1>
      </div>
      <span className="demo-badge" role="note">DEMO · DATOS FICTICIOS</span>
      <button className="btn ghost panel-toggle" onClick={onTogglePanel} aria-expanded={panelOpen}>
        {panelOpen ? 'Ocultar panel' : 'Mostrar panel'}
      </button>
    </header>
  )
}
