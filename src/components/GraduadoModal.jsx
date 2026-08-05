import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const empty = {
  nombre: '',
  telefono: '',
  carrera: 'ISND',
  num_invitados: 0,
  confirmado: false,
  mesa: '',
  grupito: '',
}

export default function GraduadoModal({ graduado, onClose, onSaved }) {
  const [form, setForm] = useState(graduado ? { ...graduado } : empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEdit = Boolean(graduado)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      nombre: form.nombre.trim(),
      telefono: form.telefono?.trim() || null,
      carrera: form.carrera?.trim() || null,
      num_invitados: Number(form.num_invitados) || 0,
      confirmado: Boolean(form.confirmado),
      mesa: form.mesa?.trim() || null,
      grupito: form.grupito?.trim() || null,
    }

    const query = isEdit
      ? supabase.from('graduados').update(payload).eq('id', graduado.id)
      : supabase.from('graduados').insert(payload)

    const { error: err } = await query
    setSaving(false)

    if (err) {
      setError(err.message)
      return
    }
    onSaved()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>
          ×
        </button>
        <h3 className="modal-title">{isEdit ? 'Editar graduado' : 'Nuevo graduado'}</h3>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nombre completo *</label>
            <input
              value={form.nombre}
              onChange={(e) => update('nombre', e.target.value)}
              placeholder="Ej. Diana Karen Sánchez Salas"
              autoFocus
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Teléfono</label>
              <input
                value={form.telefono || ''}
                onChange={(e) => update('telefono', e.target.value)}
                placeholder="833..."
              />
            </div>
            <div className="field">
              <label>Carrera</label>
              <input
                value={form.carrera || ''}
                onChange={(e) => update('carrera', e.target.value)}
                placeholder="ISND"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label># Invitados (sin contar al graduado)</label>
              <input
                type="number"
                min="0"
                value={form.num_invitados}
                onChange={(e) => update('num_invitados', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Mesa asignada</label>
              <input
                value={form.mesa || ''}
                onChange={(e) => update('mesa', e.target.value)}
                placeholder="Mesa 1"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Grupito</label>
              <input
                value={form.grupito || ''}
                onChange={(e) => update('grupito', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Confirmación</label>
              <select
                value={form.confirmado ? 'si' : 'no'}
                onChange={(e) => update('confirmado', e.target.value === 'si')}
              >
                <option value="no">Pendiente</option>
                <option value="si">Confirmado ✅</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Agregar graduado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
