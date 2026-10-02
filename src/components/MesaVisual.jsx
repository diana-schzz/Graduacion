// Dibuja una mesa (círculo o rectángulo) con sus asientos como puntos.
// `filled` es un arreglo de largo = capacidad, cada posición es null
// (asiento vacío) o { color } (asiento ocupado, coloreado por grupo).

function CircularSeats({ capacidad, filled }) {
  const size = 150
  const center = size / 2
  const radius = 58
  const dotR = 7

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={center}
        cy={center}
        r={radius - 16}
        fill="var(--bg-elev-2)"
        stroke="var(--gold-line)"
        strokeWidth="1.5"
      />
      {Array.from({ length: capacidad }).map((_, i) => {
        const angle = (i / capacidad) * 2 * Math.PI - Math.PI / 2
        const x = center + radius * Math.cos(angle)
        const y = center + radius * Math.sin(angle)
        const seat = filled[i]
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={dotR}
            fill={seat ? seat.color : 'var(--bg-elev)'}
            stroke={seat ? seat.color : 'var(--gold-line)'}
            strokeWidth="1.5"
          />
        )
      })}
    </svg>
  )
}

function RectangularSeats({ capacidad, filled }) {
  const width = 190
  const height = 110
  const marginX = 22
  const topCount = Math.ceil(capacidad / 2)
  const bottomCount = capacidad - topCount

  const positions = []
  for (let i = 0; i < topCount; i++) {
    const x = topCount === 1 ? width / 2 : marginX + (i * (width - 2 * marginX)) / (topCount - 1)
    positions.push({ x, y: 16 })
  }
  for (let i = 0; i < bottomCount; i++) {
    const x =
      bottomCount === 1 ? width / 2 : marginX + (i * (width - 2 * marginX)) / (bottomCount - 1)
    positions.push({ x, y: height - 16 })
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect
        x="16"
        y="28"
        width={width - 32}
        height={height - 56}
        rx="8"
        fill="var(--bg-elev-2)"
        stroke="var(--gold-line)"
        strokeWidth="1.5"
      />
      {positions.map((p, i) => {
        const seat = filled[i]
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="7"
            fill={seat ? seat.color : 'var(--bg-elev)'}
            stroke={seat ? seat.color : 'var(--gold-line)'}
            strokeWidth="1.5"
          />
        )
      })}
    </svg>
  )
}

export default function MesaVisual({ tipo, capacidad, filled }) {
  return tipo === 'rectangular' ? (
    <RectangularSeats capacidad={capacidad} filled={filled} />
  ) : (
    <CircularSeats capacidad={capacidad} filled={filled} />
  )
}