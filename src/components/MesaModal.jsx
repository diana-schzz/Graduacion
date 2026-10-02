import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export default function MesaModal({ mesa, onClose, onSaved }) {
  const [form, setForm] = useState(
    mesa ? { ...mesa } : { nombre: '', tipo: 'circular', capacidad: 9 }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const isEdit = Boolean(mesa)

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value }
      // Al cambiar el tipo en una mesa nueva, sugiere la capacidad típica
      if (field === 'tipo' && !isEdit) {
        next.capacidad = value === 'circular' ? 9 : 12
      }
      return next
    })
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
      tipo: form.tipo,
      capacidad: Number(form.capacidad) || 1,
    }

    const query = isEdit
      ? supabase.from('mesas').update(payload).eq('id', mesa.id)
      : supabase.from('mesas').insert(payload)

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
        <h3 className="modal-title">{isEdit ? 'Editar mesa' : 'Nueva mesa'}</h3>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nombre *</label>
            <input
              value={form.nombre}
              onChange={(e) => update('nombre', e.target.value)}
              placeholder="Ej. Mesa 1"
              autoFocus
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Forma</label>
              <select value={form.tipo} onChange={(e) => update('tipo', e.target.value)}>
                <option value="circular">Circular</option>
                <option value="rectangular">Rectangular</option>
              </select>
            </div>
            <div className="field">
              <label>Capacidad (asientos)</label>
              <input
                type="number"
                min="1"
                value={form.capacidad}
                onChange={(e) => update('capacidad', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Agregar mesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}