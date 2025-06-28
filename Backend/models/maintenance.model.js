const sql = require("mssql");

async function getAllMaintenances() {
  const request = new sql.Request();
  const result = await request.query("SELECT * FROM Maintenances WHERE is_active = 1");
  return result.recordset;
}

async function getMaintenanceByPlate(plate) {
  const request = new sql.Request();

  // Verificar si el vehículo existe y obtener su ID
  const checkVehicleQuery = `
    SELECT id FROM Vehicles
    WHERE plate = @plate
  `;
  request.input("plate", sql.NVarChar, plate);
  const checkVehicleResult = await request.query(checkVehicleQuery);
  if (checkVehicleResult.recordset.length === 0) {
    throw new Error(`No existe un vehículo con la placa ${plate}.`);
  }

  const vehicleId = checkVehicleResult.recordset[0].id;

  // Obtener los mantenimientos del vehículo utilizando el ID
  const query = `
    SELECT * FROM Maintenances
    WHERE vehicle_id = @vehicle_id AND is_active = 1
  `;
  request.input("vehicle_id", sql.Int, vehicleId);
  const result = await request.query(query);
  return result.recordset;
}

async function addMaintenance(maintenance) {
  const request = new sql.Request();

  // Validación de vehicle_id
  if (typeof maintenance.vehicle_id !== 'number' || maintenance.vehicle_id <= 0) {
    throw new Error("El ID del vehículo debe ser un número positivo.");
  }

  // Validación de unit_mileage
  if (typeof maintenance.unit_mileage !== 'number' || maintenance.unit_mileage < 0) {
    throw new Error("El kilometraje de la unidad debe ser un número no negativo.");
  }

  // Validación de mileage_date
  if (isNaN(Date.parse(maintenance.mileage_date))) {
    throw new Error("La fecha de kilometraje no es válida.");
  }

  // Validación de requires_platform_transfer
  if (typeof maintenance.requires_platform_transfer !== 'boolean') {
    throw new Error("El campo 'requires_platform_transfer' debe ser un valor booleano.");
  }

  // Validación de under_warranty
  if (typeof maintenance.under_warranty !== 'boolean') {
    throw new Error("El campo 'under_warranty' debe ser un valor booleano.");
  }

  // Validación de mechanic_contact
  if (typeof maintenance.mechanic_contact !== 'string' || maintenance.mechanic_contact.trim() === '') {
    throw new Error("El contacto del mecánico no puede estar vacío.");
  }

  const query = `
    INSERT INTO Maintenances 
    (vehicle_id, issue_description, unit_mileage, mileage_date, requires_platform_transfer, under_warranty, mechanic_contact, mechanic_phone, observations, is_active)
    VALUES (@vehicle_id, @issue_description, @unit_mileage, @mileage_date, @requires_platform_transfer, @under_warranty, @mechanic_contact, @mechanic_phone, @observations, @is_active);
    SELECT SCOPE_IDENTITY() AS id;
  `;

  request.input("vehicle_id", sql.Int, maintenance.vehicle_id);
  request.input("issue_description", sql.NVarChar, maintenance.issue_description);
  request.input("unit_mileage", sql.Int, maintenance.unit_mileage);
  request.input("mileage_date", sql.Date, maintenance.mileage_date);
  request.input("requires_platform_transfer", sql.Bit, maintenance.requires_platform_transfer);
  request.input("under_warranty", sql.Bit, maintenance.under_warranty);
  request.input("mechanic_contact", sql.NVarChar, maintenance.mechanic_contact);
  request.input("mechanic_phone", sql.NVarChar, maintenance.mechanic_phone);
  request.input("observations", sql.NVarChar, maintenance.observations || null);
  request.input("is_active", sql.Bit, maintenance.is_active || 1);

  const result = await request.query(query);
  const maintenanceId = result.recordset[0].id;

  return maintenanceId;
}

async function getMaintenanceById(id) {
  const request = new sql.Request();
  const query = `
    SELECT * FROM Maintenances WHERE id = @id AND is_active = 1
  `;
  request.input("id", sql.Int, id);
  const result = await request.query(query);
  return result.recordset[0];
}

async function updateMaintenance(id, maintenance) {
  const request = new sql.Request();

  // Validación de vehicle_id
  if (typeof maintenance.vehicle_id !== 'number' || maintenance.vehicle_id <= 0) {
    throw new Error("El ID del vehículo debe ser un número positivo.");
  }

  // Validación de unit_mileage
  if (typeof maintenance.unit_mileage !== 'number' || maintenance.unit_mileage < 0) {
    throw new Error("El kilometraje de la unidad debe ser un número no negativo.");
  }

  // Validación de mileage_date
  if (isNaN(Date.parse(maintenance.mileage_date))) {
    throw new Error("La fecha de kilometraje no es válida.");
  }

  // Validación de requires_platform_transfer
  if (typeof maintenance.requires_platform_transfer !== 'boolean') {
    throw new Error("El campo 'requires_platform_transfer' debe ser un valor booleano.");
  }

  // Validación de under_warranty
  if (typeof maintenance.under_warranty !== 'boolean') {
    throw new Error("El campo 'under_warranty' debe ser un valor booleano.");
  }

  // Validación de mechanic_contact
  if (typeof maintenance.mechanic_contact !== 'string' || maintenance.mechanic_contact.trim() === '') {
    throw new Error("El contacto del mecánico no puede estar vacío.");
  }


  const query = `
    UPDATE Maintenances 
    SET vehicle_id = @vehicle_id, issue_description = @issue_description, unit_mileage = @unit_mileage, 
        mileage_date = @mileage_date, requires_platform_transfer = @requires_platform_transfer, 
        under_warranty = @under_warranty, mechanic_contact = @mechanic_contact, 
        mechanic_phone = @mechanic_phone, observations = @observations, is_active = @is_active
    WHERE id = @id
  `;

  request.input("id", sql.Int, id);
  request.input("vehicle_id", sql.Int, maintenance.vehicle_id);
  request.input("issue_description", sql.NVarChar, maintenance.issue_description);
  request.input("unit_mileage", sql.Int, maintenance.unit_mileage);
  request.input("mileage_date", sql.Date, maintenance.mileage_date);
  request.input("requires_platform_transfer", sql.Bit, maintenance.requires_platform_transfer);
  request.input("under_warranty", sql.Bit, maintenance.under_warranty);
  request.input("mechanic_contact", sql.NVarChar, maintenance.mechanic_contact);
  request.input("mechanic_phone", sql.NVarChar, maintenance.mechanic_phone);
  request.input("observations", sql.NVarChar, maintenance.observations || null);
  request.input("is_active", sql.Bit, maintenance.is_active || 1);

  await request.query(query);
}

async function deleteMaintenance(id) {
  const request = new sql.Request();
  const query = `
    UPDATE Maintenances SET is_active = 0 WHERE id = @id
  `;
  request.input("id", sql.Int, id);
  await request.query(query);
}

module.exports = { getAllMaintenances, getMaintenanceByPlate, addMaintenance, getMaintenanceById, updateMaintenance, deleteMaintenance };