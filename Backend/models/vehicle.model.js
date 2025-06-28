const sql = require("mssql");

async function getAllVehicles(page=1, pageSize=5) {
 const offset = (page - 1) * pageSize; // Ajustamos el cálculo del OFFSET
 const request = new sql.Request();

  const query = `
    SELECT 
      id,
      region,
      dependency,
      asset_code,
      brand,
      style,
      model_year,
      heritage,
      plate
    FROM Vehicles
    WHERE is_active = 1
    ORDER BY id ASC
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
  `;
  request.input("offset", sql.Int, offset);
  request.input("pageSize", sql.Int, pageSize);

  const result = await request.query(query);
  return result.recordset;

}

async function getTotalVehicles() {
  const request = new sql.Request();
  const result = await request.query("SELECT COUNT(*) AS total FROM Vehicles WHERE is_active = 1");
  return result.recordset[0].total;
}

async function addVehicle(vehicle) {
  let request = new sql.Request();

  // Validación de los campos requeridos (excepto Plate)
  if (!vehicle.dependency || !vehicle.asset_code || !vehicle.brand || !vehicle.style || !vehicle.model_year || !vehicle.heritage) {
    throw new Error("Faltan campos requeridos: dependency, asset_code, brand, style, heritage o model_year.");
  }

  // Validación de año de modelo
  const currentYear = new Date().getFullYear();
  if (vehicle.model_year < 1990 || vehicle.model_year > currentYear) {
    throw new Error("El año de modelo debe estar entre 1990 y el año actual.");
  }

  // Validación del formato de la placa
  const plateRegex = /^(\d{6}|[A-Za-z]{3}-\d{3})$/; // Formatos: "123456" o "ABC-123"
  if (!plateRegex.test(vehicle.plate)) {
    throw new Error("El formato de la placa es incorrecto. Debe ser '123456' o 'ABC-123'.");
  }

  // Verificar si el vehículo ya existe
  const checkPlateResult = await checkPlate(vehicle.plate);
  if (checkPlateResult.exists) {
    return { exists: true, id: checkPlateResult.id };
  }

  request = new sql.Request();

  // Insertar el vehículo
  const query = `
    INSERT INTO Vehicles (region, dependency, asset_code, brand, style, model_year, heritage, plate, is_active)
    VALUES (@region, @dependency, @asset_code, @brand, @style, @model_year, @heritage, @plate, 1);
    SELECT SCOPE_IDENTITY() AS id;
  `;
  request.input("region", sql.NVarChar, vehicle.region);
  request.input("dependency", sql.NVarChar, vehicle.dependency);
  request.input("asset_code", sql.NVarChar, vehicle.asset_code);
  request.input("brand", sql.NVarChar, vehicle.brand);
  request.input("style", sql.NVarChar, vehicle.style);
  request.input("model_year", sql.Int, vehicle.model_year);
  request.input("heritage", sql.NVarChar, vehicle.heritage);
  request.input("plate", sql.NVarChar, vehicle.plate);
  request.input("is_active", sql.Bit, 1);
  const result = await request.query(query);
  const vehicleId = result.recordset[0].id;

  return { exists: false, id: vehicleId };
}

async function getVehicleById(id) {
  const request = new sql.Request();
  const query = `
    SELECT * FROM Vehicles
    WHERE id = @id
  `;
  request.input("id", sql.Int, id);
  const result = await request.query(query);
  return result.recordset[0];
}

async function updateVehicle(id, vehicle) {
  const request = new sql.Request();

  // Verifica que el vehículo exista antes de actualizarlo
  const checkQuery = `SELECT * FROM Vehicles WHERE id = @id`;
  request.input("id", sql.Int, id);

  const result = await request.query(checkQuery);

  // Si no encuentra el vehículo
  if (result.recordset.length === 0) {
    return null; // Indicar que no se encontró el vehículo
  }

  // Validación de los campos requeridos (excepto Plate)
  if (!vehicle.dependency || !vehicle.asset_code || !vehicle.brand || !vehicle.style || !vehicle.model_year || !vehicle.heritage) {
    throw new Error("Faltan campos requeridos: dependency, asset_code, brand, style, heritage o model_year.");
  }

  // Validación de año de modelo
  const currentYear = new Date().getFullYear();
  if (vehicle.model_year < 1990 || vehicle.model_year > currentYear) {
    throw new Error("El año de modelo debe estar entre 1990 y el año actual.");
  }

  // Validación del formato de la placa
  const plateRegex = /^(\d{6}|[A-Za-z]{3}-\d{3})$/; // Formatos: "123456" o "ABC-123"
  if (!plateRegex.test(vehicle.plate)) {
    throw new Error("El formato de la placa es incorrecto. Debe ser '123456' o 'ABC-123'.");
  }

  // Si el vehículo existe, realiza la actualización
  const query = `
    UPDATE Vehicles
    SET region = @Region, dependency = @Dependency, plate = @Plate, asset_code = @AssetCode,
        heritage = @Heritage, brand = @Brand, style = @Style, model_year = @ModelYear, is_active = @IsActive
    WHERE id = @id
  `;

  request.input("Region", sql.NVarChar, vehicle.region);
  request.input("Dependency", sql.NVarChar, vehicle.dependency);
  request.input("Plate", sql.NVarChar, vehicle.plate);
  request.input("AssetCode", sql.NVarChar, vehicle.asset_code);
  request.input("Heritage", sql.NVarChar, vehicle.heritage);
  request.input("Brand", sql.NVarChar, vehicle.brand);
  request.input("Style", sql.NVarChar, vehicle.style);
  request.input("ModelYear", sql.Int, vehicle.model_year);
  request.input("IsActive", sql.Bit, vehicle.is_active || 1);

  await request.query(query);

  return { ...vehicle, id }; // Retorna el vehículo actualizado
}


async function deleteVehicle(id) {
  const request = new sql.Request();

  // Verifica si el vehículo existe y está activo
  const checkQuery = `SELECT * FROM Vehicles WHERE id = @id AND is_active = 1`;
  request.input("id", sql.Int, id);

  const checkResult = await request.query(checkQuery);

  if (checkResult.recordset.length === 0) {
    return null; // Vehículo no encontrado o ya está inactivo
  }
  // Realiza la eliminación lógica 
  const query = `
    UPDATE Vehicles
    SET is_active = 0
    WHERE id = @id AND is_active = 1
  `;
  await request.query(query);

  return { id, is_active: 0 }; // Retorna el vehículo inactivo
}

//Validar que una placa no exista en la base de datos
async function checkPlate(plate) {
  const request = new sql.Request();
  const query = `
    SELECT id FROM Vehicles
    WHERE plate = @plate
  `;
  request.input("plate", sql.NVarChar, plate);
  const result = await request.query(query);
  if (result.recordset.length > 0) {
    return { exists: true, id: result.recordset[0].id };
  } else {
    return { exists: false };
  }
}


module.exports = { getAllVehicles, addVehicle, getVehicleById, updateVehicle, deleteVehicle, checkPlate, getTotalVehicles };
