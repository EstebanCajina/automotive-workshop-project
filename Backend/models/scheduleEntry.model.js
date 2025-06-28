const sql = require("mssql");

function validateScheduleEntry(entry) {
  if (typeof entry.schedule_id !== 'number' || entry.schedule_id <= 0) {
    throw new Error("El ID del horario es requerido y debe ser un número positivo.");
  }
  if (!entry.date || !(entry.date instanceof Date)) {
    throw new Error("La fecha es requerida y debe ser una instancia de Date.");
  }
  if (typeof entry.hours_worked !== 'number' || entry.hours_worked < 0) {
    throw new Error("Las horas trabajadas son requeridas y deben ser un número no negativo.");
  }
  if (typeof entry.hours_extra !== 'number' || entry.hours_extra < 0) {
    throw new Error("Las horas extra son requeridas y deben ser un número no negativo.");
  }
  if (entry.salary && (typeof entry.salary !== 'number' || entry.salary < 0)) {
    throw new Error("El salario debe ser un número no negativo.");
  }
}

async function getScheduleEntries(id) {
  if (typeof id !== 'number' || id <= 0) {
    throw new Error("El ID del horario debe ser un número positivo.");
  }
  const request = new sql.Request();
  const query = `
    SELECT * FROM ScheduleEntries
    WHERE schedule_id = @id
    ORDER BY date DESC
  `;
  request.input("id", sql.Int, id);
  const result = await request.query(query);
  return result.recordset;
}

async function getScheduleEntryById(id) {
  if (typeof id !== 'number' || id <= 0) {
    throw new Error("El ID debe ser un número positivo.");
  }
  const request = new sql.Request();
  const query = `
    SELECT * FROM ScheduleEntries
    WHERE Id = @id
  `;
  request.input("id", sql.Int, id);
  const result = await request.query(query);
  return result.recordset[0];
}

async function addScheduleEntry(entry) {
  validateScheduleEntry(entry);

  const request = new sql.Request();
  const query = `
    INSERT INTO ScheduleEntries (schedule_id, date, hours_worked, hours_extra, salary)
    VALUES (@schedule_id, @date, @hours_worked, @hours_extra, @salary);
    SELECT SCOPE_IDENTITY() AS id;
  `;
  request.input("schedule_id", sql.Int, entry.schedule_id);
  request.input("date", sql.Date, entry.date);
  request.input("hours_worked", sql.Float, entry.hours_worked);
  request.input("hours_extra", sql.Float, entry.hours_extra);
  request.input("salary", sql.Float, entry.salary || 0);
  const result = await request.query(query);
  const entryId = result.recordset[0].id;

  return entryId;
}

async function updateScheduleEntry(id, entry) {
  if (typeof id !== 'number' || id <= 0) {
    throw new Error("El ID debe ser un número positivo.");
  }
  validateScheduleEntry(entry);

  const request = new sql.Request();
  const query = `
    UPDATE ScheduleEntries
    SET schedule_id = @schedule_id, date = @date, hours_worked = @hours_worked, hours_extra = @hours_extra, salary = @salary
    WHERE Id = @id
  `;
  request.input("id", sql.Int, id);
  request.input("schedule_id", sql.Int, entry.schedule_id);
  request.input("date", sql.Date, entry.date);
  request.input("hours_worked", sql.Float, entry.hours_worked);
  request.input("hours_extra", sql.Float, entry.hours_extra);
  request.input("salary", sql.Float, entry.salary || 0);

  await request.query(query);
}

async function deleteScheduleEntry(id) {
  if (typeof id !== 'number' || id <= 0) {
    throw new Error("El ID debe ser un número positivo.");
  }
  const request = new sql.Request();
  const query = `
    DELETE FROM ScheduleEntries
    WHERE Id = @id
  `;
  request.input("id", sql.Int, id);
  await request.query(query);
}

module.exports = { getScheduleEntries, getScheduleEntryById, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry };