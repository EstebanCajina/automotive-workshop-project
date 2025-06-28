const sql = require("mssql");

async function getAllSuppliers() {
  const request = new sql.Request();
  const result = await request.query("SELECT * FROM Suppliers ORDER BY is_active DESC");
  return result.recordset;
}

async function addSupplier(supplier) {
  const request = new sql.Request();
  const query = `
    INSERT INTO Suppliers (name, phone, whatsapp_link, email, address, product_list, is_active)
    VALUES (@name, @phone, @whatsapp_link, @email, @address, @product_list, @is_active);
    SELECT SCOPE_IDENTITY() AS id;
  `;
  
  request.input("name", sql.NVarChar, supplier.name.trim());
  request.input("phone", sql.NVarChar, supplier.phone.trim());
  request.input("whatsapp_link", sql.NVarChar, supplier.whatsapp_link ? supplier.whatsapp_link.trim() : null);
  request.input("email", sql.NVarChar, supplier.email.trim());
  request.input("address", sql.NVarChar, supplier.address.trim());
  request.input("product_list", sql.NVarChar, supplier.product_list.trim());
  request.input("is_active", sql.Bit, supplier.is_active);

  const result = await request.query(query);
  return result.recordset[0].id;
}

async function getSupplierById(id) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query("SELECT * FROM Suppliers WHERE id = @id");

  if (result.recordset.length === 0) {
    throw new Error("Proveedor no encontrado.");
  }

  return result.recordset[0];
}

async function updateSupplier(id, supplier) {
  
  const request = new sql.Request();
  const query = `
    UPDATE Suppliers
    SET name = @name, phone = @phone, whatsapp_link = @whatsapp_link, 
        email = @email, address = @address, product_list = @product_list, 
        is_active = @is_active
    WHERE id = @id;
  `;
  
  request.input("name", sql.NVarChar, supplier.name.trim());
  request.input("phone", sql.NVarChar, supplier.phone.trim());
  request.input("whatsapp_link", sql.NVarChar, supplier.whatsapp_link ? supplier.whatsapp_link.trim() : null);
  request.input("email", sql.NVarChar, supplier.email.trim());
  request.input("address", sql.NVarChar, supplier.address.trim());
  request.input("product_list", sql.NVarChar, supplier.product_list.trim());
  request.input("is_active", sql.Bit, supplier.is_active);
  request.input("id", sql.Int, id);

  await request.query(query);
}

async function deleteSupplier(id) {

  const request = new sql.Request();
  request.input("id", sql.Int, id);
  await request.query("UPDATE Suppliers SET is_active = 0 WHERE id = @id");
}

async function searchSuppliersByProduct(searchTerm) {
  try {
    const request = new sql.Request();
    request.input("SearchTerm", sql.NVarChar, searchTerm); // Parametrizamos el término de búsqueda
    const result = await request.query("EXEC SearchSuppliersByProduct @SearchTerm");

    return result.recordset; // Devuelve los proveedores encontrados
  } catch (err) {
    throw new Error('Error al ejecutar el procedimiento almacenado: ' + err.message);
  }
}
module.exports = { getAllSuppliers, addSupplier, getSupplierById, updateSupplier, deleteSupplier, searchSuppliersByProduct };
