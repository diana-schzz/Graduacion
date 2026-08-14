import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { formatMoney } from '../utils/format.js'
import GraduadoModal from './GraduadoModal.jsx'
import PagosPanel from './PagosPanel.jsx'
import PlanPagoBadges from './PlanPagoBadges.jsx'

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

export default function GraduadosTab() {
  const [graduados, setGraduados] = useState([])
  const [plan, setPlan] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [search, setSearch] = useState('')
  const [carreraFiltro, setCarreraFiltro] = useState('todas')

  async function load() {
    setLoading(true)
    const [gradRes, planRes] = await Promise.all([
      supabase.from('graduados_resumen').select('*').order('nombre', { ascending: true }),
      supabase.from('plan_pagos').select('*').order('numero', { ascending: true }),
    ])
    if (gradRes.error) setError(gradRes.error.message)
    else {
      setGraduados(gradRes.data)
      setError(null)
    }
    if (!planRes.error) setPlan(planRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(g) {
    if (!confirm(`¿Eliminar a ${g.nombre}? Esto borra también sus pagos registrados.`)) return
    await supabase.from('graduados').delete().eq('id', g.id)
    load()
  }

  const carreras = useMemo(() => {
    const set = new Set(graduados.map((g) => g.carrera).filter(Boolean))
    return Array.from(set).sort()
  }, [graduados])

  const filtrados = useMemo(() => {
    return graduados.filter((g) => {
      const matchNombre = g.nombre.toLowerCase().includes(search.trim().toLowerCase())
      const matchCarrera = carreraFiltro === 'todas' || g.carrera === carreraFiltro
      return matchNombre && matchCarrera
    })
  }, [graduados, search, carreraFiltro])

  const totalGraduados = graduados.length
  const totalInvitados = graduados.reduce((s, g) => s + g.num_invitados + 1, 0)
  const totalRecaudado = graduados.reduce((s, g) => s + Number(g.abonado), 0)
  const totalRestante = graduados.reduce((s, g) => s + Number(g.restante), 0)
  const confirmados = graduados.filter((g) => g.confirmado).length

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Graduados</div>
          <div className="stat-value">{totalGraduados}</div>
          <div className="stat-sub">{confirmados} confirmados</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total asistentes</div>
          <div className="stat-value">{totalInvitados}</div>
          <div className="stat-sub">graduados + invitados</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Recaudado</div>
          <div className="stat-value small">{formatMoney(totalRecaudado)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Restante por cobrar</div>
          <div className="stat-value small">{formatMoney(totalRestante)}</div>
        </div>
      </div>

      <div className="section-head">
        <h2 className="section-title">
          <span className="divider-mark">✦</span>Graduados e invitados
        </h2>
        <button
          className="btn primary"
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
        >
          + Nuevo graduado
        </button>
      </div>

      <div className="toolbar">
        <div className="search-field">
          <SearchIcon />
          <input
            type="search"
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={carreraFiltro} onChange={(e) => setCarreraFiltro(e.target.value)}>
          <option value="todas">Todas las carreras</option>
          {carreras.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(search || carreraFiltro !== 'todas') && (
          <span className="toolbar-count">
            {filtrados.length} de {totalGraduados}
          </span>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Cargando…</div>
      ) : graduados.length === 0 ? (
        <div className="empty">Todavía no hay graduados registrados.</div>
      ) : filtrados.length === 0 ? (
        <div className="empty">No hay resultados para esa búsqueda o filtro.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Carrera</th>
                <th>Invitados</th>
                <th>Confirmó</th>
                <th>Mesa</th>
                <th>Plan de pagos</th>
                <th className="num">Costo total</th>
                <th className="num">Abonado</th>
                <th className="num">Restante</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((g) => (
                <FragmentRow
                  key={g.id}
                  g={g}
                  plan={plan}
                  expanded={expandedId === g.id}
                  onToggle={() => setExpandedId(expandedId === g.id ? null : g.id)}
                  onEdit={() => {
                    setEditing(g)
                    setShowModal(true)
                  }}
                  onDelete={() => handleDelete(g)}
                  onPagoChanged={load}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <GraduadoModal
          graduado={editing}
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

function FragmentRow({ g, plan, expanded, onToggle, onEdit, onDelete, onPagoChanged }) {
  return (
    <>
      <tr>
        <td data-label="Nombre">
          <button className="expand-btn" onClick={onToggle}>
            {expanded ? '▾' : '▸'} {g.nombre}
          </button>
        </td>
        <td data-label="Carrera">{g.carrera || '—'}</td>
        <td data-label="Invitados">{g.num_invitados}</td>
        <td data-label="Confirmó">
          <span className={`pill ${g.confirmado ? 'ok' : 'off'}`}>
            {g.confirmado ? 'Sí' : 'Pendiente'}
          </span>
        </td>
        <td data-label="Mesa">{g.mesa || '—'}</td>
        <td data-label="Plan de pagos">
          <PlanPagoBadges plan={plan} abonado={Number(g.abonado)} costoTotal={Number(g.costo_total)} />
        </td>
        <td data-label="Costo total" className="num">
          {formatMoney(g.costo_total)}
        </td>
        <td data-label="Abonado" className="num">
          {formatMoney(g.abonado)}
        </td>
        <td data-label="Restante" className="num">
          {formatMoney(g.restante)}
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
          <td colSpan={10} style={{ padding: 0 }}>
            <PagosPanel graduadoId={g.id} onChanged={onPagoChanged} />
          </td>
        </tr>
      )}
    </>
  )
}