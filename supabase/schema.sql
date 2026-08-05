-- ============================================================
-- ESQUEMA: Gestión de Graduación IEST Anáhuac
-- Corre este archivo completo en Supabase → SQL Editor → New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Configuración general del evento ----------
create table if not exists configuracion (
  id int primary key default 1,
  nombre_evento text default 'Graduación ISND - II 2026',
  fecha_evento date,
  hora_evento text,
  lugar text,
  precio_por_persona numeric not null default 1700,
  constraint solo_una_fila check (id = 1)
);

insert into configuracion (id, nombre_evento, fecha_evento, hora_evento, lugar, precio_por_persona)
values (1, 'Graduación ISND - II 2026', '2026-12-10', '7:00 PM', 'Central Andalina', 1700)
on conflict (id) do nothing;

-- ---------- Graduados ----------
create table if not exists graduados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  carrera text,
  num_invitados int not null default 0,
  confirmado boolean not null default false,
  mesa text,
  grupito text,
  created_at timestamptz not null default now()
);

-- ---------- Pagos de graduados (abonos sin límite de cantidad) ----------
create table if not exists pagos_graduados (
  id uuid primary key default gen_random_uuid(),
  graduado_id uuid not null references graduados(id) on delete cascade,
  concepto text default 'Abono',
  monto numeric not null check (monto > 0),
  fecha date not null default current_date,
  comprobante_url text,
  notas text,
  created_at timestamptz not null default now()
);

-- ---------- Proveedores ----------
create table if not exists proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text,
  contacto text,
  telefono text,
  total_contratado numeric,
  notas text,
  created_at timestamptz not null default now()
);

-- ---------- Pagos a proveedores ----------
create table if not exists pagos_proveedores (
  id uuid primary key default gen_random_uuid(),
  proveedor_id uuid not null references proveedores(id) on delete cascade,
  concepto text default 'Abono',
  monto numeric not null check (monto > 0),
  fecha date not null default current_date,
  comprobante_url text,
  notas text,
  created_at timestamptz not null default now()
);

-- ---------- Presupuesto por categoría ----------
create table if not exists presupuesto_categorias (
  id uuid primary key default gen_random_uuid(),
  categoria text not null,
  costo_total numeric default 0,
  estado text default 'Pendiente',
  orden int default 0
);

-- ---------- Vistas con cálculos automáticos ----------
create or replace view graduados_resumen as
select
  g.id,
  g.nombre,
  g.telefono,
  g.carrera,
  g.num_invitados,
  g.confirmado,
  g.mesa,
  g.grupito,
  g.created_at,
  coalesce(sum(p.monto), 0) as abonado,
  (g.num_invitados + 1) * (select precio_por_persona from configuracion where id = 1) as costo_total,
  ((g.num_invitados + 1) * (select precio_por_persona from configuracion where id = 1)) - coalesce(sum(p.monto), 0) as restante
from graduados g
left join pagos_graduados p on p.graduado_id = g.id
group by g.id;

create or replace view proveedores_resumen as
select
  pr.id,
  pr.nombre,
  pr.categoria,
  pr.contacto,
  pr.telefono,
  pr.notas,
  pr.total_contratado,
  coalesce(sum(pp.monto), 0) as pagado,
  coalesce(pr.total_contratado, 0) - coalesce(sum(pp.monto), 0) as pendiente
from proveedores pr
left join pagos_proveedores pp on pp.proveedor_id = pr.id
group by pr.id;

-- ============================================================
-- Seguridad: este proyecto no usa login (decisión del equipo).
-- Se deja la base ABIERTA con la llave "anon" para que la app
-- funcione sin autenticación. Esto significa que cualquiera con
-- tu URL + anon key puede leer/escribir datos.
-- Recomendación: agrega login más adelante (ver README) y cambia
-- estas políticas a "authenticated" cuando lo hagas.
-- ============================================================

alter table graduados enable row level security;
alter table pagos_graduados enable row level security;
alter table proveedores enable row level security;
alter table pagos_proveedores enable row level security;
alter table presupuesto_categorias enable row level security;
alter table configuracion enable row level security;

create policy "acceso_publico_graduados" on graduados for all using (true) with check (true);
create policy "acceso_publico_pagos_graduados" on pagos_graduados for all using (true) with check (true);
create policy "acceso_publico_proveedores" on proveedores for all using (true) with check (true);
create policy "acceso_publico_pagos_proveedores" on pagos_proveedores for all using (true) with check (true);
create policy "acceso_publico_presupuesto" on presupuesto_categorias for all using (true) with check (true);
create policy "acceso_publico_configuracion" on configuracion for all using (true) with check (true);

-- ============================================================
-- Datos iniciales (migrados de tu Excel) — puedes borrar este
-- bloque si prefieres capturar todo manualmente desde la app.
-- ============================================================

insert into presupuesto_categorias (categoria, costo_total, estado, orden) values
  ('Salón / Venue', 264516, 'En proceso', 1),
  ('Comida', 745, 'Pendiente', 2),
  ('Mezcladores', 193, 'Pendiente', 3),
  ('Música / DJ', 177830, 'Pendiente', 4),
  ('Fotografía', 3200, 'Liquidado', 5),
  ('Decoración', 38100, 'Pendiente', 6),
  ('Arreglos de mesa', 5200, 'Pendiente', 7),
  ('Coordinación del evento', 15000, 'Pendiente', 8),
  ('Termos', 14400, 'Pendiente', 9),
  ('Photo opportunity', 5000, 'En proceso', 10);

insert into proveedores (nombre, categoria, total_contratado) values
  ('Salón (Central Andalina)', 'Salón / Venue', 264516),
  ('Beat Factory', 'Música / DJ', 177830),
  ('Arreglos Florales', 'Decoración', null),
  ('Fotógrafo', 'Fotografía', 3200),
  ('Photo Opportunity', 'Photo opportunity', 5000);
