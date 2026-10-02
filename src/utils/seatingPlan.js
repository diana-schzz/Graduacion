// Acomoda graduados (cada uno con su grupo de invitados) en mesas,
// intentando mantener juntos a quienes comparten el mismo "grupito".
//
// parties: [{ id, nombre, tamaño, grupito }]  (tamaño = num_invitados + 1)
// mesas:   [{ id, nombre, capacidad }]
//
// Devuelve { assignments: { graduadoId: mesaId }, sinLugar: [party, ...] }

export function autoArrange(parties, mesas) {
  // 1. Agrupa por grupito (sin grupito = grupo de una sola persona/party)
  const gruposMap = new Map()
  parties.forEach((p) => {
    const key = p.grupito?.trim() ? p.grupito.trim() : `__solo_${p.id}`
    if (!gruposMap.has(key)) gruposMap.set(key, [])
    gruposMap.get(key).push(p)
  })

  const grupos = Array.from(gruposMap.values()).map((miembros) => ({
    miembros,
    total: miembros.reduce((s, m) => s + m.tamaño, 0),
  }))

  // 2. Grupos más grandes primero (first-fit decreasing)
  grupos.sort((a, b) => b.total - a.total)

  // 3. Estado de cada mesa con su capacidad restante
  const estadoMesas = mesas
    .map((m) => ({ id: m.id, capacidad: m.capacidad, restante: m.capacidad }))
    .sort((a, b) => b.capacidad - a.capacidad)

  const assignments = {}
  const sinLugar = []

  function colocar(party, mesa) {
    assignments[party.id] = mesa.id
    mesa.restante -= party.tamaño
  }

  grupos.forEach((grupo) => {
    // Intenta meter el grupito completo en una sola mesa
    const mesaCompleta = estadoMesas.find((m) => m.restante >= grupo.total)
    if (mesaCompleta) {
      grupo.miembros.forEach((party) => colocar(party, mesaCompleta))
      return
    }

    // No cabe completo: reparte lo menos posible, de mayor a menor tamaño,
    // buscando siempre la mesa más ajustada que todavía alcance (best-fit).
    const miembrosOrdenados = [...grupo.miembros].sort((a, b) => b.tamaño - a.tamaño)
    miembrosOrdenados.forEach((party) => {
      const candidatas = estadoMesas
        .filter((m) => m.restante >= party.tamaño)
        .sort((a, b) => a.restante - b.restante)
      if (candidatas.length > 0) {
        colocar(party, candidatas[0])
      } else {
        sinLugar.push(party)
      }
    })
  })

  return { assignments, sinLugar }
}