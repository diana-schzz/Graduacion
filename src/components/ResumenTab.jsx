import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { formatMoney } from '../utils/format.js'
import CategoriaModal from './CategoriaModal.jsx'

const ESTADO_CLS = {
  Pendiente: 'off',
  'En proceso': 'warn',
  Liquidado: 'ok',
}

export default function ResumenTab() {
  const [categorias, setCategorias] = useState([])
  const [graduados, setGraduados] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  async function load() {
    setLoading(true)
    const [catRes, gradRes, provRes] = await Promise.all([
      supabase.from('presupuesto_categorias').select('*').order('orden', { ascending: true }),
      supabase.from('graduados_resumen').select('abonado, restante'),
      supabase.from('proveedores_resumen').select('total_contratado, pagado, pendiente'),
    ])
    if (catRes.error) setError(catRes.error.message)
    else setError(null)
    setCategorias(catRes.data || [])
    setGraduados(gradRes.data || [])
    setProveedores(provRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(c) {
    if (!confirm(`¿Eliminar la categoría "${c.categoria}"?`)) return
    await supabase.from('presupuesto_categorias').delete().eq('id', c.id)
    load()
  }

  const totalPresupuesto = categorias.reduce((s, c) => s + Number(c.costo_total || 0), 0)
  const totalRecaudado = graduados.reduce((s, g) => s + Number(g.abonado), 0)
  const totalRestanteCobrar = graduados.reduce((s, g) => s + Number(g.restante), 0)
  const totalContratadoProveedores = proveedores.reduce(
    (s, p) => s + Number(p.total_contratado || 0),
    0
  )
  const totalPagadoProveedores = proveedores.reduce((s, p) => s + Number(p.pagado), 0)

  // Lo que realmente tenemos disponible ahora mismo: lo que han abonado
  // los graduados menos lo que ya se le ha pagado en efectivo a proveedores.
  const dineroDisponible = totalRecaudado - totalPagadoProveedores

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Presupuesto total</div>
          <div className="stat-value small">{formatMoney(totalPresupuesto)}</div>
        </div>
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
      </div>

      <div className="section-head">
        <h2 className="section-title">
          <span className="divider-mark">✦</span>Presupuesto por categoría
        </h2>
        <button
          className="btn primary"
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
        >
          + Nueva categoría
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Cargando…</div>
      ) : categorias.length === 0 ? (
        <div className="empty">Todavía no hay categorías de presupuesto.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th className="num">Costo total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id}>
                  <td data-label="Categoría">{c.categoria}</td>
                  <td data-label="Costo total" className="num">
                    {formatMoney(c.costo_total)}
                  </td>
                  <td data-label="Estado">
                    <span className={`pill ${ESTADO_CLS[c.estado] || 'off'}`}>{c.estado}</span>
                  </td>
                  <td data-label="">
                    <div className="row-actions">
                      <button
                        className="btn small"
                        onClick={() => {
                          setEditing(c)
                          setShowModal(true)
                        }}
                      >
                        Editar
                      </button>
                      <button className="btn danger small" onClick={() => handleDelete(c)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CategoriaModal
          categoria={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false)
            load()
          }}
        />
      )}
    </div>
  )
}