-- Datos migrados desde pagos.xlsx (hoja Pago Invitados)
-- Corre esto DESPUES de schema.sql

do $$
declare
  gid uuid;
begin
  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Ana Sofia Soqui Velasco', '8331178291', 'ISND', 3, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Myrna Esther Leal Salazar', '8342755564', 'ISND', 4, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Amir Dortaj Resendiz', '8331176324', 'ISND', 4, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Edgar Emiliano Jaime Romero', '8331887870', 'ISND', 4, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Jesus Adrian Perez Ramos', '8334061051', 'ISND', 3, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Gustavo Antonio Perales Castillo', '8334498817', 'ISND', 4, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Daniel Alejandro Olvera Banda', '8332679894', 'ISND', 3, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Luis Alejandro Urbina Gomez', '8334622260', 'ISND', 4, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Juan Carlos Seidller Ferniza', '8335322461', 'ISND', 4, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Roman Del Angel Juarez', '8331178864', 'ISND', 4, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Omar Emiliano Novella Arteaga', '8331670423', 'ISND', 3, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Benjamin Axel Lobato Cerecedo', '8331512292', 'ISND', 5, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 3000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Rodrigo Casas Tellez', null, 'ISND', 0, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Victor Manuel De Leon Perez', '8331590347', 'ISND', 11, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Andrea Jimena Valencia Gonzalez', '8333120712', 'ISND', 6, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 3500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Mauricio Ellian Lopez Peña', '8332889342', 'ISND', 3, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 1500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Maria Fernanda Soqui Velasco', '8334405800', 'ISND', 3, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Erick Emanuel Ortiz Anaya', '8332946505', 'ISND', 4, true)
    returning id into gid;

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Andre Doria Arizabalo', '8333436567', 'ISND', 7, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 4000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Maria Fernanda Barroso Avalos', '8331028067', 'ISND', 6, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 3500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Carlos Sebastian Gonzalez Ramirez', '8331553040', 'ISND', 3, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Jose Carlos Maron Hernandez', '8332599633', 'ISND', 2, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 1500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Andrea Vega Fong', '5625158355', 'ISND', 7, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Ivan Alejandro De Leon Ramirez', '8335367450', 'ISND', 3, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Diana Karen Sanchez Salas', '8334309575', 'ISND', 9, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 3500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Ivana Alexandra Palomo Saldivar', null, 'ISND', 5, true)
    returning id into gid;

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Edna Carolina Sanchez Gutierrez', null, 'ISND', 5, true)
    returning id into gid;

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Gonzalo Aram Ortiz Abdala', '8332881101', 'ISND', 9, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 5000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Sebastian Moctezuma Toral', '8334394627', 'ISND', 3, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Jacobo Castillo Martinez', '8334485582', 'ISND', 3, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Americo Gudini Granados', '8331885093', 'ISND', 3, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Emma Irais Sahagun Maldonado', '8332814213', 'ISND', 9, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 5000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Victor Damian Salazar Galvan', '8334920005', 'ISND', 4, true)
    returning id into gid;

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Carlos Miguel Cruz Saavedra', '8333143000', 'ISND', 7, true)
    returning id into gid;

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Valeria Segura Lara', null, 'ISND', 10, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Emely Aleyda Soto Oropeza', null, 'II', 10, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 5500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Aylan Kalep Hernandez Cruz', null, 'II', 7, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 4000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Alessandra Urbina', null, 'II', 6, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 3500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Mara Contreras', null, 'II', 6, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 3500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Nicole Courrech Turrubiates', null, 'II', 4, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 2500, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Jesus Ricardo Flores Mancilla', null, 'II', 5, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 3000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Luis Felipe Torres Gonzalez', null, 'II', 7, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 4000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Maria Guadalupe Argüelles García', null, 'II', 9, true)
    returning id into gid;
  insert into pagos_graduados (graduado_id, concepto, monto, fecha, notas)
    values (gid, 'Migrado de Excel', 5000, current_date, 'Abono acumulado importado del Excel original');

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Jose Luis Martinez', null, 'ISND', 0, false)
    returning id into gid;

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Miguel Angel Garcia Chavarro', null, 'ISND', 0, false)
    returning id into gid;

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Ruben Castelán Paz', null, 'II', 0, false)
    returning id into gid;

  insert into graduados (nombre, telefono, carrera, num_invitados, confirmado)
    values ('Alexandro Barron Guajardo', null, 'ISND', 0, true)
    returning id into gid;

end $$;