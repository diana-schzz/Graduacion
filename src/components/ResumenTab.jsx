import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { formatMoney, pct } from '../utils/format.js'

const DONUT_COLORS = [
  '#1f4a4d',
  '#a8790f',
  '#3f7a54',
  '#b3543f',
  '#8a6108',
  '#675c4f',
  '#2f5c40',
  '#96412f',
]

export default function ResumenTab() {
  const [graduados, setGraduados] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    const [gradRes, provRes] = await Promise.all([
      supabase.from('graduados_resumen').select('abonado, restante'),
      supabase.from('proveedores_resumen').select('nombre, total_contratado, pagado, pendiente'),
    ])
    if (gradRes.error || provRes.error) setError((gradRes.error || provRes.error).message)
    else setError(null)
    setGraduados(gradRes.data || [])
    setProveedores(provRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const totalRecaudado = graduados.reduce((s, g) => s + Number(g.abonado), 0)
  const totalRestanteCobrar = graduados.reduce((s, g) => s + Number(g.restante), 0)
  const totalContratadoProveedores = proveedores.reduce(
    (s, p) => s + Number(p.total_contratado || 0),
    0
  )
  const totalPagadoProveedores = proveedores.reduce((s, p) => s + Number(p.pagado), 0)
  const dineroDisponible = totalRecaudado - totalPagadoProveedores

  const conTotal = proveedores.filter((p) => p.total_contratado)
  const circunferencia = 2 * Math.PI * 52

  let acumulado = 0
  const segmentos = conTotal.map((p, i) => {
    const valor = Number(p.total_contratado)
    const fraccion = totalContratadoProveedores > 0 ? valor / totalContratadoProveedores : 0
    const dash = fraccion * circunferencia
    const offset = acumulado
    acumulado += dash
    return {
      nombre: p.nombre,
      valor,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
      dasharray: `${dash} ${circunferencia - dash}`,
      dashoffset: -offset,
    }
  })

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Recaudado (graduados)</div>
          <div className="stat-value small">{formatMoney(totalRecaudado)}</div>
          <div className="stat-sub">Falta cobrar {formatMoney(totalRestanteCobrar)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pagado a proveedores</div>
          <div className="stat-value small">{formatMoney(totalPagadoProveedores)}</div>
          <div className="stat-sub">de {formatMoney(totalContratadoProveedores)} contratado</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dinero disponible ahora</div>
          <div
            className="stat-value small"
            style={{ color: dineroDisponible >= 0 ? 'var(--sage-bright)' : 'var(--rust-bright)' }}
          >
            {formatMoney(dineroDisponible)}
          </div>
          <div className="stat-sub">Recaudado − pagado a proveedores</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Proveedores contratados</div>
          <div className="stat-value">{proveedores.length}</div>
        </div>
      </div>

      <div className="section-head">
        <h2 className="section-title">
          <span className="divider-mark">✦</span>Panorama financiero
        </h2>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Cargando…</div>
      ) : proveedores.length === 0 ? (
        <div className="empty">
          Todavía no hay proveedores. Agrégalos en la pestaña "Proveedores" para ver el panorama
          aquí.
        </div>
      ) : (
        <div className="budget-dashboard">
          <div className="budget-panel">
            <h3>Avance de pago por proveedor</h3>
            {proveedores.map((p) => {
              const porcentaje = pct(p.pagado, p.total_contratado)
              const sinTotal = !p.total_contratado
              return (
                <div className="bar-row" key={p.nombre}>
                  <span className="bar-label">{p.nombre}</span>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${porcentaje >= 100 ? 'complete' : ''}`}
                      style={{ width: sinTotal ? 0 : `${porcentaje}%` }}
                    />
                  </div>
                  <span className="bar-amount">
                    {sinTotal
                      ? `${formatMoney(p.pagado)} pagado`
                      : `${formatMoney(p.pagado)} / ${formatMoney(p.total_contratado)}`}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="budget-panel">
            <h3>Distribución del gasto contratado</h3>
            {conTotal.length === 0 ? (
              <p className="text-block">
                Agrega el "Total contratado" a tus proveedores para ver aquí cómo se reparte el
                gasto.
              </p>
            ) : (
              <div className="donut-wrap">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="52" fill="none" stroke="var(--bg-elev-2)" strokeWidth="16" />
                  {segmentos.map((s) => (
                    <circle
                      key={s.nombre}
                      cx="70"
                      cy="70"
                      r="52"
                      fill="none"
                      stroke={s.color}
                      strokeWidth="16"
                      strokeDasharray={s.dasharray}
                      strokeDashoffset={s.dashoffset}
                      transform="rotate(-90 70 70)"
                    />
                  ))}
                </svg>
                <div className="donut-legend">
                  {segmentos.map((s) => (
                    <div className="donut-legend-item" key={s.nombre}>
                      <span className="donut-legend-dot" style={{ background: s.color }} />
                      <span>
                        {s.nombre} · {formatMoney(s.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}