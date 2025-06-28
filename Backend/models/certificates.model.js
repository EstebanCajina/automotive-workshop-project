const sql = require("mssql");

// Obtener todos los certificados con paginación
async function getAllCertificates(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const request = new sql.Request();

  const query = `
    SELECT 
      id, 
      type, 
      emission_date, 
      expiration_date, 
      emisory_entity, 
      is_active
    FROM Certificates 
    WHERE is_active = 1  
    ORDER BY id OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`;

  request.input("offset", sql.Int, offset);
  request.input("pageSize", sql.Int, pageSize);

  const result = await request.query(query);

  // No convertir los archivos a Base64, solo retornar los datos
  return result.recordset;
}

// Obtener un certificado por ID
async function getCertificateById(id) {
  const request = new sql.Request();
  const query = `
    SELECT 
      id, 
      type, 
      emission_date, 
      expiration_date, 
      emisory_entity, 
      is_active,
      certificate_file
    FROM Certificates WHERE id = @id`;

  request.input("id", sql.Int, id);
  const result = await request.query(query);
  if (result.recordset.length === 0) return null;

  return result.recordset[0];
}

// Obtener el archivo de un certificado por ID
async function getCertificateFileById(id) {
  const request = new sql.Request();
  const query = `
    SELECT certificate_file
    FROM Certificates WHERE id = @id`;

  request.input("id", sql.Int, id);
  const result = await request.query(query);
  if (result.recordset.length === 0) return null;

  const file = result.recordset[0].certificate_file;
  return file;
}

// Crear un nuevo certificado
async function createCertificate(data, fileBuffer) {
  const { type, emission_date, expiration_date, emisory_entity } = data;
  const request = new sql.Request();

  const query = `
    INSERT INTO Certificates (type, emission_date, expiration_date, emisory_entity, certificate_file, is_active)
    VALUES (@type, @emission_date, @expiration_date, @emisory_entity, @file, 1)`;

  request.input("type", sql.NVarChar, type);
  request.input("emission_date", sql.Date, emission_date);
  request.input("expiration_date", sql.Date, expiration_date);
  request.input("emisory_entity", sql.NVarChar, emisory_entity);
  request.input("file", sql.VarBinary, fileBuffer);

  await request.query(query);
}

// Actualizar un certificado
async function updateCertificate(id, data, fileBuffer) {
  const { type, emission_date, expiration_date, emisory_entity } = data;
  const request = new sql.Request();

  let query = `
    UPDATE Certificates
    SET type = @type, emission_date = @emission_date, 
        expiration_date = @expiration_date, emisory_entity = @emisory_entity`;

  if (fileBuffer) {
    query += `, certificate_file = @file`;
    request.input("file", sql.VarBinary, fileBuffer);
  }

  query += ` WHERE id = @id`;

  request.input("id", sql.Int, id);
  request.input("type", sql.NVarChar, type);
  request.input("emission_date", sql.Date, emission_date);
  request.input("expiration_date", sql.Date, expiration_date);
  request.input("emisory_entity", sql.NVarChar, emisory_entity);

  await request.query(query);
}

// Desactivar un certificado (en lugar de eliminarlo)
async function deleteCertificate(id) {
  const request = new sql.Request();
  const query = `UPDATE Certificates SET is_active = 0 WHERE id = @id`;

  request.input("id", sql.Int, id);
  await request.query(query);
}

async function getTotalCertificates() {
  try {
    const request = new sql.Request();
    const query = `SELECT COUNT(*) AS total FROM Certificates WHERE is_active = 1`;

    const result = await request.query(query);
    return result.recordset[0].total;
  } catch (error) {
    throw new Error(
      "Error al obtener el total de certificados: " + error.message
    );
  }
}

module.exports = {
  getAllCertificates,
  getCertificateById,
  getCertificateFileById, // Nueva función para obtener el archivo
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getTotalCertificates,
};
