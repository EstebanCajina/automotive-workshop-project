const sql = require("mssql");

async function getAllMaintenanceEntries(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize; // Ajustamos el cálculo del OFFSET correctamente
  const request = new sql.Request();

  const query = `
    SELECT 
      me.id,
      me.maintenance_id,
      me.entry_time,
      me.estimated_completion,
      me.maintenance_status,
      me.assigned_mechanic,
      me.is_active,
      v.id AS vehicle_id,
      v.plate AS vehicle_plate
    FROM MaintenanceEntry me
    INNER JOIN Maintenances m ON me.maintenance_id = m.id
    INNER JOIN Vehicles v ON m.vehicle_id = v.id
    WHERE me.is_active = 1
    ORDER BY me.id ASC
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
  `;

  request.input("offset", sql.Int, offset);
  request.input("pageSize", sql.Int, pageSize);

  const result = await request.query(query);
  return result.recordset;
}

async function getMaintenanceEntryById(id) {
  if (!id || isNaN(id) || id < 1) {
    throw new Error(
      "Falta el id de la entrada de mantenimiento o id inválido."
    );
  }

  const request = new sql.Request();
  const query = `
    SELECT 
      me.id,
      me.maintenance_id,
      me.entry_time,
      me.estimated_completion,
      me.maintenance_status,
      me.assigned_mechanic,
      me.is_active,
      v.plate AS vehicle_plate
    FROM MaintenanceEntry me
    INNER JOIN Maintenances m ON me.maintenance_id = m.id
    INNER JOIN Vehicles v ON m.vehicle_id = v.id
    WHERE me.id = @id AND me.is_active = 1
  `;
  request.input("id", sql.Int, id);
  const result = await request.query(query);
  return result.recordset[0];
}

async function addMaintenanceEntry(entry) {
  const request = new sql.Request();

  // Validación de los campos requeridos
  if (!entry.maintenance_id) {
    throw new Error("Faltan campos requeridos: maintenance_id");
  }

  if (!entry.entry_time) {
    throw new Error("Faltan campos requeridos: entry_time");
  }

  if (!entry.maintenance_status) {
    throw new Error("Faltan campos requeridos: maintenance_status");
  }

  if (
    !["Pendiente", "En progreso", "Completado", "En prórroga"].includes(
      entry.maintenance_status
    )
  ) {
    throw new Error(
      "El estado de mantenimiento debe ser uno de los siguientes: Pendiente, En progreso, Completado, Cancelado."
    );
  }

  //validar que la fecha sea valida
  if (isNaN(Date.parse(entry.entry_time))) {
    throw new Error("La fecha de inicio no es válida.");
  }

  //validar que la fecha de finalización estimada sea mayor a la fecha de inicio
  if (
    entry.estimated_completion &&
    entry.entry_time > entry.estimated_completion
  ) {
    throw new Error(
      "La fecha de finalización estimada debe ser mayor a la fecha de inicio."
    );
  }

  const query = `
    INSERT INTO MaintenanceEntry (maintenance_id, entry_time, estimated_completion, maintenance_status, assigned_mechanic, is_active)
    VALUES (@maintenance_id, @entry_time, @estimated_completion, @maintenance_status, @assigned_mechanic, @is_active);
    SELECT SCOPE_IDENTITY() AS id;
  `;
  request.input("maintenance_id", sql.Int, entry.maintenance_id);
  request.input("entry_time", sql.DateTime, entry.entry_time);
  request.input(
    "estimated_completion",
    sql.DateTime,
    entry.estimated_completion || null
  );
  request.input("maintenance_status", sql.NVarChar, entry.maintenance_status);
  request.input(
    "assigned_mechanic",
    sql.NVarChar,
    entry.assigned_mechanic || null
  );
  request.input("is_active", sql.Bit, entry.is_active || 1);
  const result = await request.query(query);
  const entryId = result.recordset[0].id;

  return entryId;
}

async function updateMaintenanceEntry(id, entry) {
  const request = new sql.Request();

  if (!id || isNaN(id) || id < 1) {
    throw new Error(
      "Falta el id de la entrada de mantenimiento o id invalido."
    );
  }

  // Validación de los campos requeridos
  if (!entry.maintenance_id) {
    throw new Error("Faltan campos requeridos: maintenance_id");
  }

  if (!entry.entry_time) {
    throw new Error("Faltan campos requeridos: entry_time");
  }

  if (!entry.maintenance_status) {
    throw new Error("Faltan campos requeridos: maintenance_status");
  }

  if (
    !["Pendiente", "En progreso", "Completado", "En prórroga"].includes(
      entry.maintenance_status
    )
  ) {
    throw new Error(
      "El estado de mantenimiento debe ser uno de los siguientes: Pendiente, En progreso, Completado, Cancelado."
    );
  }

  //validar que la fecha sea valida
  if (isNaN(Date.parse(entry.entry_time))) {
    throw new Error("La fecha de inicio no es válida.");
  }

  //validar que la fecha de finalización estimada sea mayor a la fecha de inicio
  if (
    entry.estimated_completion &&
    entry.entry_time > entry.estimated_completion
  ) {
    throw new Error(
      "La fecha de finalización estimada debe ser mayor a la fecha de inicio."
    );
  }

  //validar que el id exista
  const entryExists = await getMaintenanceEntryById(id);
  if (!entryExists) {
    throw new Error(`La entrada de mantenimiento con id ${id} no existe.`);
  }

  const query = `
    UPDATE MaintenanceEntry
    SET maintenance_id = @maintenance_id, entry_time = @entry_time, estimated_completion = @estimated_completion,
        maintenance_status = @maintenance_status, assigned_mechanic = @assigned_mechanic, is_active = @is_active
    WHERE id = @id
  `;
  request.input("id", sql.Int, id);
  request.input("maintenance_id", sql.Int, entry.maintenance_id);
  request.input("entry_time", sql.DateTime, entry.entry_time);
  request.input(
    "estimated_completion",
    sql.DateTime,
    entry.estimated_completion || null
  );
  request.input("maintenance_status", sql.NVarChar, entry.maintenance_status);
  request.input(
    "assigned_mechanic",
    sql.NVarChar,
    entry.assigned_mechanic || null
  );
  request.input("is_active", sql.Bit, entry.is_active || 1);

  await request.query(query);
}

async function deleteMaintenanceEntry(id) {
  if (!id || isNaN(id) || id < 1) {
    throw new Error(
      "Falta el id de la entrada de mantenimiento o id invalido."
    );
  }

  if (!(await getMaintenanceEntryById(id))) {
    throw new Error(`La entrada de mantenimiento con id ${id} no existe.`);
  }

  const request = new sql.Request();
  const query = `
    UPDATE MaintenanceEntry
    SET is_active = 0
    WHERE id = @id
  `;
  request.input("id", sql.Int, id);
  await request.query(query);
}

module.exports = {
  getAllMaintenanceEntries,
  getMaintenanceEntryById,
  addMaintenanceEntry,
  updateMaintenanceEntry,
  deleteMaintenanceEntry,
};
