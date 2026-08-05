import { useState } from 'react'
import GraduadosTab from './components/GraduadosTab.jsx'
import ProveedoresTab from './components/ProveedoresTab.jsx'
import ResumenTab from './components/ResumenTab.jsx'

const TABS = [
  { key: 'graduados', label: 'Graduados & Invitados' },
  { key: 'proveedores', label: 'Proveedores' },
  { key: 'resumen', label: 'Resumen' },
]

function Sunburst() {
  const rays = Array.from({ length: 24 })
  return (
    <svg className="sunburst" viewBox="0 0 900 400" fill="none">
      {rays.map((_, i) => {
        const angle = (i / (rays.length - 1)) * 180 - 90
        const rad = (angle * Math.PI) / 180
        const x = 450 + Math.sin(rad) * 420
        const y = 400 - Math.cos(rad) * 420
        return (
          <line
            key={i}
            x1="450"
            y1="400"
            x2={x}
            y2={y}
            stroke="url(#goldFade)"
            strokeWidth="1.5"
          />
        )
      })}
      <defs>
        <linearGradient id="goldFade" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#a8790f" stopOpacity="0.5" />
          <stop offset="1" stopColor="#a8790f" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function App() {
  const [tab, setTab] = useState('graduados')

  return (
    <div className="shell">
      <header className="header">
        <Sunburst />
        <div className="eyebrow">IEST Anáhuac · Generación 2026</div>
        <h1 className="title">
          Graduación <em>ISND</em>
        </h1>
        <div className="subtitle">
          Central Andalina · <b>10 de diciembre, 2026</b> · Control de invitados y pagos
        </div>
      </header>

      <nav className="nav">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`nav-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === 'graduados' && <GraduadosTab />}
        {tab === 'proveedores' && <ProveedoresTab />}
        {tab === 'resumen' && <ResumenTab />}
      </main>
    </div>
  )
}
