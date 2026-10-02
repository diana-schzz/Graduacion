import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { autoArrange } from '../utils/seatingPlan.js'
import MesaModal from './MesaModal.jsx'
import MesaVisual from './MesaVisual.jsx'

const PALETA = [
  '#1f4a4d',
  '#a8790f',
  '#3f7a54',
  '#b3543f',
  '#8a6108',
  '#675c4f',
  '#2f5c40',
  '#96412f',
  '#16373a',
  '#c9a227',
]

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

export default function MesasTab() {
  const [mesas, setMesas] = useState([])
  const [graduados, setGraduados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [arranging, setArranging] = useState(false)

  async function load() {
    setLoading(true)
    const [mesasRes, gradRes] = await Promise.all([
      supabase.from('mesas').select('*').order('orden', { ascending: true }),
      supabase
        .from('graduados')
        .select('id, nombre, grupito, num_invitados, confirmado, mesa_id')
        .order('nombre', { ascending: true }),
    ])
    if (mesasRes.error || gradRes.error) setError((mesasRes.error || gradRes.error).message)
    else setError(null)
    setMesas(mesasRes.data || [])
    setGraduados(gradRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const parties = useMemo(
    () =>
      graduados.map((g) => ({
        id: g.id,
        nombre: g.nombre,
        grupito: g.grupito,
        tamaño: g.num_invitados + 1,
        mesa_id: g.mesa_id,
      })),
    [graduados]
  )

  const asignados = parties.filter((p) => p.mesa_id)
  const sinMesa = parties.filter((p) => !p.mesa_id)

  const totalCapacidad = mesas.reduce((s, m) => s + m.capacidad, 0)
  const totalOcupado = asignados.reduce((s, p) => s + p.tamaño, 0)
  const totalPersonas = parties.reduce((s, p) => s + p.tamaño, 0)

  async function handleDeleteMesa(m) {
    if (
      !confirm(
        `¿Eliminar "${m.nombre}"? Los graduados que estaban ahí quedarán sin mesa asignada.`
      )
    )
      return
    await supabase.from('mesas').delete().eq('id', m.id)
    load()
  }

  async function handleAsignar(graduadoId, mesaId) {
    await supabase
      .from('graduados')
      .update({ mesa_id: mesaId || null })
      .eq('id', graduadoId)
    load()
  }

  async function handleAutoAcomodar() {
    if (
      !confirm(
        'Esto va a reacomodar a TODOS los graduados en las mesas disponibles, agrupando por "Grupito" cuando sea posible. Los acomodos manuales que ya tengas se van a reemplazar. ¿Continuar?'
      )
    )
      return

    if (mesas.length === 0) {
      alert('Primero agrega al menos una mesa.')
      return
    }

    setArranging(true)
    const { assignments, sinLugar } = autoArrange(parties, mesas)

    await Promise.all(
      Object.entries(assignments).map(([graduadoId, mesaId]) =>
        supabase.from('graduados').update({ mesa_id: mesaId }).eq('id', graduadoId)
      )
    )
    // A quien no alcanzó lugar, se deja explícitamente sin mesa
    await Promise.all(
      sinLugar.map((p) => supabase.from('graduados').update({ mesa_id: null }).eq('id', p.id))
    )

    setArranging(false)
    await load()

    if (sinLugar.length > 0) {
      alert(
        `Acomodo listo. ${sinLugar.length} persona(s) no encontraron lugar porque no hay capacidad suficiente: ${sinLugar
          .map((p) => p.nombre)
          .join(', ')}. Agrega otra mesa o ajusta capacidades.`
      )
    }
  }

  function construirFilled(mesaId, capacidad) {
    const ocupantes = asignados.filter((p) => p.mesa_id === mesaId)
    const filled = new Array(capacidad).fill(null)
    let idx = 0
    ocupantes.forEach((p, i) => {
      const color = PALETA[i % PALETA.length]
      for (let s = 0; s < p.tamaño && idx < capacidad; s++, idx++) {
        filled[idx] = { color }
      }
    })
    return { filled, ocupantes }
  }

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Mesas</div>
          <div className="stat-value">{mesas.length}</div>
          <div className="stat-sub">{totalCapacidad} asientos en total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Personas sentadas</div>
          <div className="stat-value">{totalOcupado}</div>
          <div className="stat-sub">de {totalPersonas} asistentes</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sin mesa asignada</div>
          <div className="stat-value">{sinMesa.reduce((s, p) => s + p.tamaño, 0)}</div>
          <div className="stat-sub">{sinMesa.length} graduado(s) por acomodar</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Espacio libre</div>
          <div className="stat-value">{Math.max(totalCapacidad - totalOcupado, 0)}</div>
          <div className="stat-sub">asientos disponibles</div>
        </div>
      </div>

      <div className="section-head">
        <h2 className="section-title">
          <span className="divider-mark">✦</span>Acomodo de mesas
        </h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={handleAutoAcomodar} disabled={arranging}>
            {arranging ? 'Acomodando…' : '✨ Autoacomodar'}
          </button>
          <button
            className="btn primary"
            onClick={() => {
              setEditing(null)
              setShowModal(true)
            }}
          >
            + Nueva mesa
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Cargando…</div>
      ) : mesas.length === 0 ? (
        <div className="empty">Todavía no hay mesas. Agrega la primera con "+ Nueva mesa".</div>
      ) : (
        <div className="mesas-grid">
          {mesas.map((m) => {
            const { filled, ocupantes } = construirFilled(m.id, m.capacidad)
            const ocupado = ocupantes.reduce((s, p) => s + p.tamaño, 0)
            return (
              <div className="mesa-card" key={m.id}>
                <div className="mesa-card-header">
                  <div>
                    <div className="mesa-card-title">{m.nombre}</div>
                    <div className="mesa-card-sub">
                      {m.tipo === 'circular' ? 'Circular' : 'Rectangular'} · {ocupado}/{m.capacidad}
                    </div>
                  </div>
                  <div className="row-actions">
                    <button
                      className="btn-icon"
                      title="Editar mesa"
                      onClick={() => {
                        setEditing(m)
                        setShowModal(true)
                      }}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="btn-icon danger"
                      title="Eliminar mesa"
                      onClick={() => handleDeleteMesa(m)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                <div className="mesa-visual-wrap">
                  <MesaVisual tipo={m.tipo} capacidad={m.capacidad} filled={filled} />
                </div>

                {ocupantes.length === 0 ? (
                  <p className="text-block" style={{ textAlign: 'center' }}>
                    Mesa vacía
                  </p>
                ) : (
                  <ul className="mesa-occupant-list">
                    {ocupantes.map((p, i) => (
                      <li key={p.id}>
                        <span
                          className="mesa-occupant-dot"
                          style={{ background: PALETA[i % PALETA.length] }}
                        />
                        <span className="mesa-occupant-name">{p.nombre}</span>
                        <span className="mesa-occupant-size">({p.tamaño})</span>
                        <button className="mesa-occupant-remove" onClick={() => handleAsignar(p.id, null)}>
                          quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="section-head" style={{ marginTop: 36 }}>
        <h2 className="section-title">
          <span className="divider-mark">✦</span>Sin mesa asignada
        </h2>
      </div>

      {sinMesa.length === 0 ? (
        <div className="empty">Todos los graduados ya tienen mesa.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Grupito</th>
                <th>Personas</th>
                <th>Asignar a mesa</th>
              </tr>
            </thead>
            <tbody>
              {sinMesa.map((p) => (
                <tr key={p.id}>
                  <td data-label="Nombre">{p.nombre}</td>
                  <td data-label="Grupito">{p.grupito || '—'}</td>
                  <td data-label="Personas">{p.tamaño}</td>
                  <td data-label="Asignar a mesa">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) handleAsignar(p.id, e.target.value)
                      }}
                    >
                      <option value="" disabled>
                        Elegir mesa…
                      </option>
                      {mesas.map((m) => {
                        const ocupado = asignados
                          .filter((a) => a.mesa_id === m.id)
                          .reduce((s, a) => s + a.tamaño, 0)
                        const restante = m.capacidad - ocupado
                        const cabe = restante >= p.tamaño
                        return (
                          <option key={m.id} value={m.id} disabled={!cabe}>
                            {m.nombre} ({restante} libre{restante === 1 ? '' : 's'}
                            {!cabe ? ' · no alcanza' : ''})
                          </option>
                        )
                      })}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <MesaModal
          mesa={editing}
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