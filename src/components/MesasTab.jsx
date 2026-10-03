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
  const [asientos, setAsientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [arranging, setArranging] = useState(false)
  // { [graduadoId]: { mesaId, cantidad } } valores en edición del formulario de asignación manual
  const [form, setForm] = useState({})
  // Filtro de la tabla "Sin mesa asignada" por cantidad de personas pendientes
  const [filtroMin, setFiltroMin] = useState('')
  const [filtroMax, setFiltroMax] = useState('')

  async function load() {
    setLoading(true)
    const [mesasRes, gradRes, asientosRes] = await Promise.all([
      supabase.from('mesas').select('*').order('orden', { ascending: true }),
      supabase
        .from('graduados')
        .select('id, nombre, grupito, num_invitados, confirmado')
        .order('nombre', { ascending: true }),
      supabase.from('asientos_mesa').select('*'),
    ])
    const err = mesasRes.error || gradRes.error || asientosRes.error
    setError(err ? err.message : null)
    setMesas(mesasRes.data || [])
    setGraduados(gradRes.data || [])
    setAsientos(asientosRes.data || [])
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
      })),
    [graduados]
  )

  const colorPorGraduado = useMemo(() => {
    const map = {}
    parties.forEach((p, i) => {
      map[p.id] = PALETA[i % PALETA.length]
    })
    return map
  }, [parties])

  const asignadoPorGraduado = useMemo(() => {
    const map = {}
    asientos.forEach((a) => {
      map[a.graduado_id] = (map[a.graduado_id] || 0) + a.cantidad
    })
    return map
  }, [asientos])

  const pendientes = useMemo(
    () =>
      parties
        .map((p) => ({ ...p, asignado: asignadoPorGraduado[p.id] || 0, restante: p.tamaño - (asignadoPorGraduado[p.id] || 0) }))
        .filter((p) => p.restante > 0),
    [parties, asignadoPorGraduado]
  )

  const pendientesFiltrados = useMemo(() => {
    const min = filtroMin !== '' ? Number(filtroMin) : null
    const max = filtroMax !== '' ? Number(filtroMax) : null
    return pendientes.filter((p) => {
      if (min !== null && p.restante < min) return false
      if (max !== null && p.restante > max) return false
      return true
    })
  }, [pendientes, filtroMin, filtroMax])

  const ocupadoPorMesa = useMemo(() => {
    const map = {}
    asientos.forEach((a) => {
      map[a.mesa_id] = (map[a.mesa_id] || 0) + a.cantidad
    })
    return map
  }, [asientos])

  const totalCapacidad = mesas.reduce((s, m) => s + m.capacidad, 0)
  const totalOcupado = asientos.reduce((s, a) => s + a.cantidad, 0)
  const totalPersonas = parties.reduce((s, p) => s + p.tamaño, 0)
  const totalPendiente = pendientes.reduce((s, p) => s + p.restante, 0)

  async function handleDeleteMesa(m) {
    if (
      !confirm(
        `¿Eliminar "${m.nombre}"? Los acomodos que tenía esa mesa se eliminarán y esos graduados quedarán sin mesa asignada.`
      )
    )
      return
    await supabase.from('asientos_mesa').delete().eq('mesa_id', m.id)
    await supabase.from('mesas').delete().eq('id', m.id)
    load()
  }

  function capacidadRestante(mesaId) {
    const mesa = mesas.find((m) => m.id === mesaId)
    if (!mesa) return 0
    return mesa.capacidad - (ocupadoPorMesa[mesaId] || 0)
  }

  async function handleAsignarManual(party) {
    const valores = form[party.id] || {}
    const mesaId = valores.mesaId
    const cantidad = Number(valores.cantidad ?? party.restante)

    if (!mesaId) {
      alert('Elige una mesa.')
      return
    }
    if (!cantidad || cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0.')
      return
    }
    if (cantidad > party.restante) {
      alert(`Solo quedan ${party.restante} persona(s) sin mesa de ${party.nombre}.`)
      return
    }
    const libres = capacidadRestante(mesaId)
    if (cantidad > libres) {
      alert(`Esa mesa solo tiene ${libres} lugar(es) libre(s).`)
      return
    }

    await supabase.from('asientos_mesa').insert({ graduado_id: party.id, mesa_id: mesaId, cantidad })
    setForm((f) => ({ ...f, [party.id]: { mesaId: '', cantidad: '' } }))
    load()
  }

  async function handleQuitar(asientoId) {
    await supabase.from('asientos_mesa').delete().eq('id', asientoId)
    load()
  }

  async function handleAutoAcomodar() {
    if (
      !confirm(
        'Esto va a reacomodar a TODOS los graduados en las mesas disponibles, agrupando por "Grupito" cuando sea posible y dividiendo a alguien entre varias mesas solo si no cabe completo en ninguna. Los acomodos manuales que ya tengas se van a reemplazar. ¿Continuar?'
      )
    )
      return

    if (mesas.length === 0) {
      alert('Primero agrega al menos una mesa.')
      return
    }

    setArranging(true)
    const { assignments, sinLugar } = autoArrange(parties, mesas)

    // Limpia todos los acomodos actuales y guarda los nuevos
    await supabase.from('asientos_mesa').delete().gte('cantidad', 0)
    if (assignments.length > 0) {
      await supabase.from('asientos_mesa').insert(
        assignments.map((a) => ({ graduado_id: a.graduadoId, mesa_id: a.mesaId, cantidad: a.cantidad }))
      )
    }

    setArranging(false)
    await load()

    if (sinLugar.length > 0) {
      const detalle = sinLugar.map((p) => `${p.nombre} (${p.cantidad})`).join(', ')
      alert(
        `Acomodo listo. No alcanzó lugar para: ${detalle}. Agrega otra mesa o amplía capacidades.`
      )
    }
  }

  function construirFilled(mesaId, capacidad) {
    const ocupantes = asientos
      .filter((a) => a.mesa_id === mesaId)
      .map((a) => {
        const grad = parties.find((p) => p.id === a.graduado_id)
        return {
          asientoId: a.id,
          graduadoId: a.graduado_id,
          nombre: grad ? grad.nombre : '(graduado eliminado)',
          tamañoTotal: grad ? grad.tamaño : a.cantidad,
          cantidad: a.cantidad,
          color: colorPorGraduado[a.graduado_id] || '#999',
        }
      })
    const filled = new Array(capacidad).fill(null)
    let idx = 0
    ocupantes.forEach((o) => {
      for (let s = 0; s < o.cantidad && idx < capacidad; s++, idx++) {
        filled[idx] = { color: o.color }
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
          <div className="stat-value">{totalPendiente}</div>
          <div className="stat-sub">{pendientes.length} graduado(s) por acomodar</div>
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
            const ocupado = ocupantes.reduce((s, o) => s + o.cantidad, 0)
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
                    {ocupantes.map((o) => (
                      <li key={o.asientoId}>
                        <span className="mesa-occupant-dot" style={{ background: o.color }} />
                        <span className="mesa-occupant-name">{o.nombre}</span>
                        <span className="mesa-occupant-size">
                          ({o.cantidad}
                          {o.cantidad !== o.tamañoTotal ? ` de ${o.tamañoTotal} · dividido` : ''})
                        </span>
                        <button className="mesa-occupant-remove" onClick={() => handleQuitar(o.asientoId)}>
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

      {pendientes.length > 0 && (
        <div className="filtro-pendientes">
          <span className="filtro-pendientes-label">Filtrar por personas pendientes:</span>
          <input
            type="number"
            min="1"
            placeholder="mín."
            value={filtroMin}
            onChange={(e) => setFiltroMin(e.target.value)}
          />
          <span>–</span>
          <input
            type="number"
            min="1"
            placeholder="máx."
            value={filtroMax}
            onChange={(e) => setFiltroMax(e.target.value)}
          />
          {(filtroMin !== '' || filtroMax !== '') && (
            <button
              className="btn-icon"
              title="Quitar filtro"
              onClick={() => {
                setFiltroMin('')
                setFiltroMax('')
              }}
            >
              ✕
            </button>
          )}
          <span className="mesa-occupant-size">
            {pendientesFiltrados.length} de {pendientes.length} graduado(s)
          </span>
        </div>
      )}

      {pendientes.length === 0 ? (
        <div className="empty">Todos los graduados ya tienen mesa.</div>
      ) : pendientesFiltrados.length === 0 ? (
        <div className="empty">Ningún graduado pendiente coincide con ese filtro.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Grupito</th>
                <th>Por acomodar</th>
                <th>Cantidad</th>
                <th>Mesa</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pendientesFiltrados.map((p) => {
                const valores = form[p.id] || {}
                return (
                  <tr key={p.id}>
                    <td data-label="Nombre">
                      {p.nombre}
                      {p.asignado > 0 && (
                        <div className="mesa-occupant-size" style={{ marginTop: 2 }}>
                          ya tiene {p.asignado} de {p.tamaño} sentado(s) en otra mesa
                        </div>
                      )}
                    </td>
                    <td data-label="Grupito">{p.grupito || '—'}</td>
                    <td data-label="Por acomodar">{p.restante}</td>
                    <td data-label="Cantidad">
                      <input
                        type="number"
                        min="1"
                        max={p.restante}
                        placeholder={String(p.restante)}
                        value={valores.cantidad ?? ''}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [p.id]: { ...valores, cantidad: e.target.value } }))
                        }
                        style={{ width: 70 }}
                      />
                    </td>
                    <td data-label="Mesa">
                      <select
                        value={valores.mesaId ?? ''}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [p.id]: { ...valores, mesaId: e.target.value } }))
                        }
                      >
                        <option value="" disabled>
                          Elegir mesa…
                        </option>
                        {mesas.map((m) => {
                          const restante = capacidadRestante(m.id)
                          return (
                            <option key={m.id} value={m.id} disabled={restante <= 0}>
                              {m.nombre} ({restante} libre{restante === 1 ? '' : 's'})
                            </option>
                          )
                        })}
                      </select>
                    </td>
                    <td data-label="">
                      <button className="btn" onClick={() => handleAsignarManual(p)}>
                        Asignar
                      </button>
                    </td>
                  </tr>
                )
              })}
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