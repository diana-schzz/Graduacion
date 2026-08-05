import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { formatMoney, formatDate } from '../utils/format.js'

export default function PagosPanel({ graduadoId, onChanged }) {
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ concepto: 'Abono', monto: '', fecha: '', notas: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('pagos_graduados')
      .select('*')
      .eq('graduado_id', graduadoId)
      .order('fecha', { ascending: false })
    if (!err) setPagos(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graduadoId])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.monto || Number(form.monto) <= 0) {
      setError('Ingresa un monto válido.')
      return
    }
    setSaving(true)
    setError(null)
    const { error: err } = await supabase.from('pagos_graduados').insert({
      graduado_id: graduadoId,
      concepto: form.concepto || 'Abono',
      monto: Number(form.monto),
      fecha: form.fecha || new Date().toISOString().slice(0, 10),
      notas: form.notas || null,
    })
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setForm({ concepto: 'Abono', monto: '', fecha: '', notas: '' })
    setShowForm(false)
    load()
    onChanged?.()
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este pago?')) return
    await supabase.from('pagos_graduados').delete().eq('id', id)
    load()
    onChanged?.()
  }

  return (
    <div className="subrow-panel">
      {loading ? (
        <div className="loading">Cargando pagos…</div>
      ) : (
        <>
          {pagos.length === 0 ? (
            <p className="text-block" style={{ margin: '4px 0 14px' }}>
              Sin pagos registrados todavía.
            </p>
          ) : (
            <table style={{ marginBottom: 14 }}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Fecha</th>
                  <th className="num">Monto</th>
                  <th>Notas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id}>
                    <td data-label="Concepto">{p.concepto}</td>
                    <td data-label="Fecha">{formatDate(p.fecha)}</td>
                    <td data-label="Monto" className="num">
                      {formatMoney(p.monto)}
                    </td>
                    <td data-label="Notas">{p.notas || '—'}</td>
                    <td data-label="">
                      <button className="btn danger small" onClick={() => handleDelete(p.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!showForm ? (
            <button className="btn small" onClick={() => setShowForm(true)}>
              + Registrar pago
            </button>
          ) : (
            <form onSubmit={handleAdd}>
              {error && <div className="error-banner">{error}</div>}
              <div className="field-row">
                <div className="field">
                  <label>Concepto</label>
                  <input
                    value={form.concepto}
                    onChange={(e) => setForm((f) => ({ ...f, concepto: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>Monto *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.monto}
                    onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
                    autoFocus
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>Notas</label>
                  <input
                    value={form.notas}
                    onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modal-actions" style={{ borderTop: 'none', paddingTop: 0 }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setShowForm(false)
                    setError(null)
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar pago'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
}
