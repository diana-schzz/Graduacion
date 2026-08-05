import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const ESTADOS = ['Pendiente', 'En proceso', 'Liquidado']

export default function CategoriaModal({ categoria, onClose, onSaved }) {
  const [form, setForm] = useState(
    categoria ? { ...categoria } : { categoria: '', costo_total: '', estado: 'Pendiente' }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const isEdit = Boolean(categoria)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.categoria.trim()) {
      setError('El nombre de la categoría es obligatorio.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      categoria: form.categoria.trim(),
      costo_total: form.costo_total === '' ? 0 : Number(form.costo_total),
      estado: form.estado,
    }

    const query = isEdit
      ? supabase.from('presupuesto_categorias').update(payload).eq('id', categoria.id)
      : supabase.from('presupuesto_categorias').insert(payload)

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
        <h3 className="modal-title">{isEdit ? 'Editar categoría' : 'Nueva categoría'}</h3>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Categoría *</label>
            <input
              value={form.categoria}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
              placeholder="Ej. Decoración"
              autoFocus
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Costo total</label>
              <input
                type="number"
                min="0"
                value={form.costo_total ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, costo_total: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Estado</label>
              <select
                value={form.estado}
                onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
              >
                {ESTADOS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Agregar categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
