import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const empty = {
  nombre: '',
  categoria: '',
  contacto: '',
  telefono: '',
  total_contratado: '',
  notas: '',
}

export default function ProveedorModal({ proveedor, onClose, onSaved }) {
  const [form, setForm] = useState(proveedor ? { ...proveedor } : empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const isEdit = Boolean(proveedor)

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
      categoria: form.categoria?.trim() || null,
      contacto: form.contacto?.trim() || null,
      telefono: form.telefono?.trim() || null,
      total_contratado: form.total_contratado === '' ? null : Number(form.total_contratado),
      notas: form.notas?.trim() || null,
    }

    const query = isEdit
      ? supabase.from('proveedores').update(payload).eq('id', proveedor.id)
      : supabase.from('proveedores').insert(payload)

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
        <h3 className="modal-title">{isEdit ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nombre *</label>
            <input
              value={form.nombre}
              onChange={(e) => update('nombre', e.target.value)}
              placeholder="Ej. Salón Central Andalina"
              autoFocus
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Categoría</label>
              <input
                value={form.categoria || ''}
                onChange={(e) => update('categoria', e.target.value)}
                placeholder="Salón, DJ, Foto, Decoración…"
              />
            </div>
            <div className="field">
              <label>Total contratado</label>
              <input
                type="number"
                min="0"
                value={form.total_contratado ?? ''}
                onChange={(e) => update('total_contratado', e.target.value)}
                placeholder="Deja vacío si aún no hay total"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Persona de contacto</label>
              <input
                value={form.contacto || ''}
                onChange={(e) => update('contacto', e.target.value)}
                placeholder="Nombre del contacto"
              />
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input
                value={form.telefono || ''}
                onChange={(e) => update('telefono', e.target.value)}
                placeholder="833..."
              />
            </div>
          </div>

          <div className="field">
            <label>Notas</label>
            <textarea
              rows={3}
              value={form.notas || ''}
              onChange={(e) => update('notas', e.target.value)}
              placeholder="Condiciones del contrato, fecha límite, detalles…"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Agregar proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
