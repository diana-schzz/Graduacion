export function computePlanStatus(installments, abonado, costoTotal) {
  if (!installments || installments.length === 0) return []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sorted = [...installments].sort((a, b) => a.numero - b.numero)
  let acumuladoPorcentaje = 0

  return sorted.map((inst) => {
    acumuladoPorcentaje += Number(inst.porcentaje)
    const montoEsperado = (costoTotal * acumuladoPorcentaje) / 100
    const cubierto = abonado >= montoEsperado - 0.01
    const fechaLimite = new Date(inst.fecha_limite + 'T00:00:00')
    const diffDias = Math.ceil((fechaLimite - today) / (1000 * 60 * 60 * 24))

    let estado
    if (cubierto) estado = 'pagado'
    else if (diffDias < 0) estado = 'atrasado'
    else if (diffDias <= 3) estado = 'vence_pronto'
    else estado = 'pendiente'

    return { ...inst, montoEsperado, cubierto, diffDias, estado }
  })
}