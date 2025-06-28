const sql = require("mssql");
const { getMaintenanceEntryById } = require("./maintenanceEntry.model");

async function getAllMaintenanceEntryExtensions(idMaintenanceEntry) {


if (!idMaintenanceEntry) {
    throw new Error("Falta el id de la entrada de mantenimiento.");
}

if (isNaN(idMaintenanceEntry)) {
    throw new Error("Id de la entrada de mantenimiento no es un número.");
}

if (idMaintenanceEntry < 1) {
    throw new Error("Id de la entrada de mantenimiento inválido.");
}

  if (!(await getMaintenanceEntryById(idMaintenanceEntry))) {
    throw new Error(`La entrada de mantenimiento con id ${idMaintenanceEntry} no existe.`);
  }

  const request = new sql.Request();
  const query = `SELECT * FROM MaintenanceEntryExtension WHERE entry_id = @idMaintenanceEntry ORDER BY extension_time ASC`;
  request.input("idMaintenanceEntry", sql.Int, idMaintenanceEntry);
  const result = await request.query(query);
  return result.recordset;
}

async function getMaintenanceEntryExtensionById(id) {
  if (!id || isNaN(id) || id < 1) {
    throw new Error(
      "Falta el id de la prórroga de entrada de mantenimiento o id inválido."
    );
  }

  const request = new sql.Request();
  const query = `
    SELECT * FROM MaintenanceEntryExtension
    WHERE id = @id
  `;
  request.input("id", sql.Int, id);
  const result = await request.query(query);
  return result.recordset[0];
}

async function addMaintenanceEntryExtension(extension) {
  const request = new sql.Request();

  // Validación de los campos requeridos
  if (!extension.entry_id) {
    throw new Error("Faltan campos requeridos: entry_id");
  }

  if (!extension.extension_time) {
    throw new Error("Faltan campos requeridos: extension_time");
  }

  // Validar que la fecha sea válida
  if (isNaN(Date.parse(extension.extension_time))) {
    throw new Error("La fecha de la prórroga no es válida.");
  }

  // Validar que el id de la entrada de mantenimiento exista
  const entryExists = await getMaintenanceEntryById(extension.entry_id);
  if (!entryExists) {
    throw new Error(
      `La entrada de mantenimiento con id ${extension.entry_id} no existe.`
    );
  }

  const query = `
    INSERT INTO MaintenanceEntryExtension (entry_id, extension_time, extension_reason)
    VALUES (@entry_id, @extension_time, @extension_reason);
    SELECT SCOPE_IDENTITY() AS id;
  `;
  request.input("entry_id", sql.Int, extension.entry_id);
  request.input("extension_time", sql.DateTime, extension.extension_time);
  request.input(
    "extension_reason",
    sql.NVarChar,
    extension.extension_reason || null
  );
  const result = await request.query(query);
  const extensionId = result.recordset[0].id;

  return extensionId;
}

async function updateMaintenanceEntryExtension(id, extension) {
  const request = new sql.Request();

  if (!id || isNaN(id) || id < 1) {
    throw new Error(
      "Falta el id de la prórroga de entrada de mantenimiento o id inválido."
    );
  }

  // Validación de los campos requeridos
  if (!extension.entry_id) {
    throw new Error("Faltan campos requeridos: entry_id");
  }

  if (!extension.extension_time) {
    throw new Error("Faltan campos requeridos: extension_time");
  }

  // Validar que la fecha sea válida
  if (isNaN(Date.parse(extension.extension_time))) {
    throw new Error("La fecha de la prórroga no es válida.");
  }

  // Validar que el id de la entrada de mantenimiento exista
  const entryExists = await getMaintenanceEntryById(extension.entry_id);
  if (!entryExists) {
    throw new Error(
      `La entrada de mantenimiento con id ${extension.entry_id} no existe.`
    );
  }

  const query = `
    UPDATE MaintenanceEntryExtension
    SET entry_id = @entry_id, extension_time = @extension_time, extension_reason = @extension_reason
    WHERE id = @id
  `;
  request.input("id", sql.Int, id);
  request.input("entry_id", sql.Int, extension.entry_id);
  request.input("extension_time", sql.DateTime, extension.extension_time);
  request.input(
    "extension_reason",
    sql.NVarChar,
    extension.extension_reason || null
  );

  await request.query(query);
}

async function deleteMaintenanceEntryExtension(id) {
  if (!id || isNaN(id) || id < 1) {
    throw new Error(
      "Falta el id de la prórroga de entrada de mantenimiento o id inválido."
    );
  }

  if (!(await getMaintenanceEntryExtensionById(id))) {
    throw new Error(
      `La prórroga de entrada de mantenimiento con id ${id} no existe.`
    );
  }

  const request = new sql.Request();
  const query = `
    DELETE FROM MaintenanceEntryExtension
    WHERE id = @id
  `;
  request.input("id", sql.Int, id);
  await request.query(query);
}

module.exports = {
  getAllMaintenanceEntryExtensions,
  getMaintenanceEntryExtensionById,
  addMaintenanceEntryExtension,
  updateMaintenanceEntryExtension,
  deleteMaintenanceEntryExtension,
};
