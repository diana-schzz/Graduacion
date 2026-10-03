// Acomoda graduados (cada uno con su grupo de invitados) en mesas,
// intentando mantener juntos a quienes comparten el mismo "grupito",
// y dividiendo a un mismo graduado entre varias mesas SOLO cuando es
// inevitable (su tamaño no cabe completo en ninguna mesa disponible).
//
// parties: [{ id, nombre, tamaño, grupito }]  (tamaño = num_invitados + 1)
// mesas:   [{ id, nombre, capacidad }]
//
// Devuelve:
//   {
//     assignments: [{ graduadoId, mesaId, cantidad }, ...],  // una fila por "trozo"
//     sinLugar: [{ id, nombre, cantidad }, ...]               // personas que no cupieron en ningún lado
//   }

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

  const assignments = []
  const sinLugar = []

  function colocarCompleto(party, mesa) {
    assignments.push({ graduadoId: party.id, mesaId: mesa.id, cantidad: party.tamaño })
    mesa.restante -= party.tamaño
  }

  // Reparte a UNA persona (con todos sus invitados) entre varias mesas,
  // usando siempre primero la mesa con más espacio libre.
  function dividirEntreMesas(party) {
    let faltante = party.tamaño
    const ordenadas = [...estadoMesas].sort((a, b) => b.restante - a.restante)
    for (const mesa of ordenadas) {
      if (faltante <= 0) break
      if (mesa.restante <= 0) continue
      const cantidad = Math.min(mesa.restante, faltante)
      assignments.push({ graduadoId: party.id, mesaId: mesa.id, cantidad })
      mesa.restante -= cantidad
      faltante -= cantidad
    }
    if (faltante > 0) {
      sinLugar.push({ id: party.id, nombre: party.nombre, cantidad: faltante })
    }
  }

  grupos.forEach((grupo) => {
    // Intenta meter el grupito completo en una sola mesa
    const mesaCompleta = estadoMesas.find((m) => m.restante >= grupo.total)
    if (mesaCompleta) {
      grupo.miembros.forEach((party) => colocarCompleto(party, mesaCompleta))
      return
    }

    // No cabe completo: coloca a cada miembro, de mayor a menor tamaño,
    // intentando primero una sola mesa (best-fit); si ni la mesa con más
    // espacio libre alcanza para ese miembro, se divide entre varias mesas.
    const miembrosOrdenados = [...grupo.miembros].sort((a, b) => b.tamaño - a.tamaño)
    miembrosOrdenados.forEach((party) => {
      const candidatas = estadoMesas
        .filter((m) => m.restante >= party.tamaño)
        .sort((a, b) => a.restante - b.restante)
      if (candidatas.length > 0) {
        colocarCompleto(party, candidatas[0])
      } else {
        dividirEntreMesas(party)
      }
    })
  })

  return { assignments, sinLugar }
}