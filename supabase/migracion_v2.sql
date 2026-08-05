-- ============================================================
-- MIGRACIÓN v2: solo corre esto si YA habías corrido schema.sql
-- antes y no quieres perder tus datos. Agrega los campos nuevos
-- de proveedores (categoría, contacto, teléfono, notas).
--
-- Si es tu primera vez configurando la base, IGNORA este archivo
-- y corre únicamente schema.sql.
-- ============================================================

alter table proveedores add column if not exists categoria text;
alter table proveedores add column if not exists contacto text;
alter table proveedores add column if not exists telefono text;
alter table proveedores add column if not exists notas text;

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
