import { computePlanStatus } from '../utils/paymentPlan.js'

const ESTADO_LABEL = {
  pagado: 'Pagado',
  vence_pronto: 'Vence pronto',
  atrasado: 'Atrasado',
  pendiente: 'Aún no vence',
}

export default function PlanPagoBadges({ plan, abonado, numPersonas }) {
  if (!plan || plan.length === 0) {
    return <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>
  }

  const estados = computePlanStatus(plan, abonado, numPersonas)
  const alerta =
    estados.find((e) => e.estado === 'atrasado') || estados.find((e) => e.estado === 'vence_pronto')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {estados.map((e) => (
          <span
            key={e.numero}
            title={`Abono ${e.numero} · ${ESTADO_LABEL[e.estado]}`}
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: e.estado === 'pendiente' ? 'var(--muted)' : '#fff',
              background:
                e.estado === 'pagado'
                  ? 'var(--sage-bright)'
                  : e.estado === 'atrasado'
                  ? 'var(--rust-bright)'
                  : e.estado === 'vence_pronto'
                  ? 'var(--gold)'
                  : 'var(--bg-elev-2)',
              border: e.estado === 'pendiente' ? '1px solid var(--gold-line)' : 'none',
            }}
          >
            {e.estado === 'pagado' ? '✓' : e.estado === 'atrasado' ? '✕' : e.numero}
          </span>
        ))}
      </div>
      {alerta && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: alerta.estado === 'atrasado' ? 'var(--rust-bright)' : 'var(--gold-bright)',
          }}
        >
          Abono {alerta.numero}{' '}
          {alerta.estado === 'atrasado'
            ? 'atrasado'
            : `vence en ${alerta.diffDias === 0 ? 'hoy' : alerta.diffDias + ' día' + (alerta.diffDias === 1 ? '' : 's')}`}
        </span>
      )}
    </div>
  )
}