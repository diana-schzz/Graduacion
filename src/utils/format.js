export function formatMoney(value) {
  const n = Number(value) || 0
  return n.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  })
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function pct(part, total) {
  if (!total) return 0
  return Math.min(100, Math.round((part / total) * 100))
}
