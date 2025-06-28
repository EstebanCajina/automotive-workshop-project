const sql = require("mssql");

function validateSchedule(schedule) {
  if (!schedule.identification || typeof schedule.identification !== 'string') {
    throw new Error("La identificación es requerida y debe ser una cadena de texto.");
  }
  if (!schedule.name || typeof schedule.name !== 'string') {
    throw new Error("El nombre es requerido y debe ser una cadena de texto.");
  }
  if (typeof schedule.hourly_rate !== 'number' || schedule.hourly_rate <= 0) {
    throw new Error("La tarifa por hora es requerida y debe ser un número positivo.");
  }
  if (typeof schedule.extra_hourly_rate !== 'number' || schedule.extra_hourly_rate <= 0) {
    throw new Error("La tarifa por hora extra es requerida y debe ser un número positivo.");
  }
  if (schedule.workday_hours && (typeof schedule.workday_hours !== 'number' || schedule.workday_hours <= 0)) {
    throw new Error("Las horas de jornada laboral deben ser un número positivo.");
  }
}

async function getSchedules() {
  const request = new sql.Request();
  const result = await request.query("SELECT * FROM Schedules ORDER BY Id ASC");
  return result.recordset;
}

async function getScheduleById(id) {
  if (typeof id !== 'number' || id <= 0) {
    throw new Error("El ID debe ser un número positivo.");
  }
  const request = new sql.Request();
  const query = `
    SELECT * FROM Schedules
    WHERE Id = @id
  `;
  request.input("id", sql.Int, id);
  const result = await request.query(query);
  return result.recordset[0];
}

async function getScheduleByIdentification(identification) {
  if (!identification || typeof identification !== 'string') {
    throw new Error("La identificación es requerida y debe ser una cadena de texto.");
  }
  const request = new sql.Request();
  const query = `
    SELECT * FROM Schedules
    WHERE identification = @identification
  `;
  request.input("identification", sql.NVarChar, identification);
  const result = await request.query(query);
  return result.recordset[0];
}

async function addSchedule(schedule) {
  validateSchedule(schedule);

  const request = new sql.Request();

  // Verificar si ya existe alguien con la misma identificación
  const checkQuery = `
    SELECT Id FROM Schedules
    WHERE identification = @identification
  `;
  request.input("identification", sql.NVarChar, schedule.identification);
  const checkResult = await request.query(checkQuery);

  if (checkResult.recordset.length > 0) {
    // Si ya existe, actualizar los datos
    const existingId = checkResult.recordset[0].Id;
    const updateQuery = `
      UPDATE Schedules
      SET hourly_rate = @hourly_rate, extra_hourly_rate = @extra_hourly_rate, workday_hours = @workday_hours
      WHERE Id = @id
    `;
    request.input("id", sql.Int, existingId);
    request.input("hourly_rate", sql.Float, schedule.hourly_rate);
    request.input("extra_hourly_rate", sql.Float, schedule.extra_hourly_rate);
    request.input("workday_hours", sql.Float, schedule.workday_hours || 9.6);
    await request.query(updateQuery);
    return existingId;
  } else {
    // Si no existe, agregar un nuevo registro
    const insertQuery = `
      INSERT INTO Schedules (identification, name, hourly_rate, extra_hourly_rate, workday_hours)
      VALUES (@identification, @name, @hourly_rate, @extra_hourly_rate, @workday_hours);
      SELECT SCOPE_IDENTITY() AS id;
    `;
    request.input("name", sql.NVarChar, schedule.name);
    request.input("hourly_rate", sql.Float, schedule.hourly_rate);
    request.input("extra_hourly_rate", sql.Float, schedule.extra_hourly_rate);
    request.input("workday_hours", sql.Float, schedule.workday_hours || 9.6);
    const result = await request.query(insertQuery);
    const scheduleId = result.recordset[0].id;
    return scheduleId;
  }
}

async function updateSchedule(id, schedule) {
  if (typeof id !== 'number' || id <= 0) {
    throw new Error("El ID debe ser un número positivo.");
  }
  validateSchedule(schedule);

  const request = new sql.Request();
  const query = `
    UPDATE Schedules
    SET identification = @identification, name = @name, hourly_rate = @hourly_rate,
        extra_hourly_rate = @extra_hourly_rate, workday_hours = @workday_hours
    WHERE Id = @id
  `;
  request.input("id", sql.Int, id);
  request.input("identification", sql.NVarChar, schedule.identification);
  request.input("name", sql.NVarChar, schedule.name);
  request.input("hourly_rate", sql.Float, schedule.hourly_rate);
  request.input("extra_hourly_rate", sql.Float, schedule.extra_hourly_rate);
  request.input("workday_hours", sql.Float, schedule.workday_hours || 9.6);

  await request.query(query);
}

async function deleteSchedule(id) {
  if (typeof id !== 'number' || id <= 0) {
    throw new Error("El ID debe ser un número positivo.");
  }
  const request = new sql.Request();
  const query = `
    DELETE FROM Schedules
    WHERE Id = @id
  `;
  request.input("id", sql.Int, id);
  await request.query(query);
}

module.exports = { getSchedules, getScheduleById, getScheduleByIdentification, addSchedule, updateSchedule, deleteSchedule };