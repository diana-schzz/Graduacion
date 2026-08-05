import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { formatMoney, pct } from '../utils/format.js'
import ProveedorModal from './ProveedorModal.jsx'
import PagosProveedorPanel from './PagosProveedorPanel.jsx'

export default function ProveedoresTab() {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  async function load() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('proveedores_resumen')
      .select('*')
      .order('nombre', { ascending: true })
    if (err) setError(err.message)
    else {
      setProveedores(data)
      setError(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(p) {
    if (!confirm(`¿Eliminar a ${p.nombre}? Esto borra también sus pagos registrados.`)) return
    await supabase.from('proveedores').delete().eq('id', p.id)
    load()
  }

  const totalContratado = proveedores.reduce((s, p) => s + Number(p.total_contratado || 0), 0)
  const totalPagado = proveedores.reduce((s, p) => s + Number(p.pagado), 0)
  const totalPendiente = proveedores.reduce((s, p) => s + Number(p.pendiente || 0), 0)

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Proveedores</div>
          <div className="stat-value">{proveedores.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total contratado</div>
          <div className="stat-value small">{formatMoney(totalContratado)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pagado</div>
          <div className="stat-value small">{formatMoney(totalPagado)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pendiente</div>
          <div className="stat-value small">{formatMoney(totalPendiente)}</div>
        </div>
      </div>

      <div className="section-head">
        <h2 className="section-title">
          <span className="divider-mark">✦</span>Proveedores
        </h2>
        <button
          className="btn primary"
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
        >
          + Nuevo proveedor
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Cargando…</div>
      ) : proveedores.length === 0 ? (
        <div className="empty">Todavía no hay proveedores registrados.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Categoría</th>
                <th className="num">Contratado</th>
                <th className="num">Pagado</th>
                <th className="num">Pendiente</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <ProveedorRow
                  key={p.id}
                  p={p}
                  expanded={expandedId === p.id}
                  onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  onEdit={() => {
                    setEditing(p)
                    setShowModal(true)
                  }}
                  onDelete={() => handleDelete(p)}
                  onPagoChanged={load}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProveedorModal
          proveedor={editing}
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

function ProveedorRow({ p, expanded, onToggle, onEdit, onDelete, onPagoChanged }) {
  const porcentaje = pct(p.pagado, p.total_contratado)
  const estado = !p.total_contratado
    ? { label: 'Sin total', cls: 'off' }
    : porcentaje >= 100
    ? { label: 'Liquidado', cls: 'ok' }
    : porcentaje > 0
    ? { label: 'En proceso', cls: 'warn' }
    : { label: 'Sin pagos', cls: 'off' }

  const tieneInfo = p.categoria || p.contacto || p.telefono || p.notas

  return (
    <>
      <tr>
        <td data-label="Proveedor">
          <button className="expand-btn" onClick={onToggle}>
            {expanded ? '▾' : '▸'} {p.nombre}
          </button>
        </td>
        <td data-label="Categoría">{p.categoria || '—'}</td>
        <td data-label="Contratado" className="num">
          {p.total_contratado ? formatMoney(p.total_contratado) : '—'}
        </td>
        <td data-label="Pagado" className="num">
          {formatMoney(p.pagado)}
        </td>
        <td data-label="Pendiente" className="num">
          {p.total_contratado ? formatMoney(p.pendiente) : '—'}
        </td>
        <td data-label="Estado">
          <span className={`pill ${estado.cls}`}>{estado.label}</span>
        </td>
        <td data-label="">
          <div className="row-actions">
            <button className="btn small" onClick={onEdit}>
              Editar
            </button>
            <button className="btn danger small" onClick={onDelete}>
              Eliminar
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} style={{ padding: 0 }}>
            <div className="subrow-panel" style={{ paddingBottom: tieneInfo ? 0 : 16 }}>
              {tieneInfo && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  {p.contacto && (
                    <div>
                      <div className="stat-label" style={{ marginBottom: 2 }}>
                        Contacto
                      </div>
                      <div className="text-block">{p.contacto}</div>
                    </div>
                  )}
                  {p.telefono && (
                    <div>
                      <div className="stat-label" style={{ marginBottom: 2 }}>
                        Teléfono
                      </div>
                      <div className="text-block">{p.telefono}</div>
                    </div>
                  )}
                  {p.notas && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div className="stat-label" style={{ marginBottom: 2 }}>
                        Notas
                      </div>
                      <div className="text-block">{p.notas}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <PagosProveedorPanel proveedorId={p.id} onChanged={onPagoChanged} />
          </td>
        </tr>
      )}
    </>
  )
}
