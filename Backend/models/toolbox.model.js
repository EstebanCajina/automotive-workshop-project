const sql = require("mssql");

async function getAllToolboxes(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const request = new sql.Request();

  const query = `
    SELECT 
      id, 
      mechanic_name, 
      box_number, 
      tools_list, 
      observations, 
      assignment_date, 
      is_assigned
    FROM Toolboxes 
    WHERE is_active = 1
    ORDER BY id ASC
    OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
  `;

  request.input("offset", sql.Int, offset);
  request.input("pageSize", sql.Int, pageSize);

  const result = await request.query(query);

  return result.recordset; // ✅ SOLO DEVUELVE LOS REGISTROS, SIN ESTRUCTURA DE PAGINACIÓN
}

// Nueva función para contar total de registros
async function getTotalToolboxes() {
  const request = new sql.Request();
  const query = `SELECT COUNT(*) AS total FROM Toolboxes WHERE is_active = 1`;
  const result = await request.query(query);
  return result.recordset[0].total;
}

async function createToolbox(toolbox) {
  const request = new sql.Request();

  // Validaciones
  if (!toolbox.mechanic_name || toolbox.mechanic_name.trim() === "") {
    throw new Error("El nombre del mecánico es obligatorio.");
  }
  if (!toolbox.box_number || toolbox.box_number.trim() === "") {
    throw new Error("El número de caja es obligatorio.");
  }
  if (!toolbox.tools_list || toolbox.tools_list.trim() === "") {
    throw new Error("Debe incluir herramientas en la caja.");
  }

  // Verificar que `box_number` sea único
  request.input("box_number", sql.NVarChar, toolbox.box_number.trim());
  const existingBox = await request.query(
    "SELECT COUNT(*) AS count FROM Toolboxes WHERE box_number = @box_number AND is_active = 1"
  );
  if (existingBox.recordset[0].count > 0) {
    throw new Error(
      `El número de caja "${toolbox.box_number}" ya está en uso.`
    );
  }

  // Insertar la caja de herramientas
  const query = `
    INSERT INTO Toolboxes (mechanic_name, box_number, tools_list, observations)
    VALUES (@mechanic_name, @box_number, @tools_list, @observations);
    SELECT SCOPE_IDENTITY() AS id;   
  `;

  request.input("mechanic_name", sql.NVarChar, toolbox.mechanic_name.trim());
  request.input("tools_list", sql.NVarChar, toolbox.tools_list.trim());
  request.input(
    "observations",
    sql.NVarChar,
    toolbox.observations ? toolbox.observations.trim() : null
  );

  try {
    const result = await request.query(query);
    return {
      success: true,
      message: "Caja de herramientas creada correctamente.",
      id: result.recordset[0].id,
    };
  } catch (error) {
    console.error("Error al agregar la caja de herramientas:", error);
    throw new Error("Error al agregar la caja de herramientas");
  }
}

async function getToolboxById(id) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query(
    "SELECT * FROM Toolboxes WHERE id = @id AND is_active = 1"
  );

  if (result.recordset.length === 0) {
    throw new Error("Caja de herramientas no encontrada.");
  }

  return result.recordset[0];
}

async function updateToolbox(id, toolbox) {
  const request = new sql.Request();

  if (!id || isNaN(id) || id < 1) {
    throw new Error("ID inválido para la caja de herramientas.");
  }

  // Verificar si la caja existe antes de actualizar
  const existingToolbox = await getToolboxById(id);
  if (!existingToolbox) {
    throw new Error(`No se encontró una caja de herramientas con ID ${id}.`);
  }

  // Validaciones
  if (!toolbox.mechanic_name || toolbox.mechanic_name.trim() === "") {
    throw new Error("El nombre del mecánico es obligatorio.");
  }
  if (!toolbox.box_number || toolbox.box_number.trim() === "") {
    throw new Error("El número de caja es obligatorio.");
  }
  if (!toolbox.tools_list || toolbox.tools_list.trim() === "") {
    throw new Error("Debe incluir herramientas en la caja.");
  }

  const query = `
    UPDATE Toolboxes
    SET mechanic_name = @mechanic_name, 
        box_number = @box_number, 
        tools_list = @tools_list, 
        observations = @observations, 
        is_assigned = @is_assigned, 
        is_active = @is_active
    WHERE id = @id;
  `;

  request.input("mechanic_name", sql.NVarChar, toolbox.mechanic_name.trim());
  request.input("box_number", sql.NVarChar, toolbox.box_number.trim());
  request.input("tools_list", sql.NVarChar, toolbox.tools_list.trim());
  request.input(
    "observations",
    sql.NVarChar,
    toolbox.observations ? toolbox.observations.trim() : null
  );
  request.input("is_assigned", sql.Bit, toolbox.is_assigned);
  request.input("is_active", sql.Bit, toolbox.is_active || true);
  request.input("id", sql.Int, id);

  await request.query(query);

  return {
    success: true,
    message: `Caja de herramientas con ID ${id} actualizada correctamente.`,
  };
}

async function deleteToolbox(id) {
  const request = new sql.Request();

  if (!id || isNaN(id) || id < 1) {
    throw new Error("ID inválido para la caja de herramientas.");
  }

  // Verificar si la caja existe antes de eliminar
  const existingToolbox = await getToolboxById(id);
  if (!existingToolbox) {
    throw new Error(`No se encontró una caja de herramientas con ID ${id}.`);
  }

  // Asegurarse de declarar correctamente el parámetro @id
  request.input("id", sql.Int, id);

  // Ejecutar la consulta SQL con el parámetro correctamente declarado
  const result = await request.query(
    "UPDATE Toolboxes SET is_active = 0 WHERE id = @id"
  );

  return {
    success: result.rowsAffected[0] > 0,
    message:
      result.rowsAffected[0] > 0
        ? `Caja de herramientas con ID ${id} eliminada correctamente.`
        : "No se pudo eliminar la caja de herramientas.",
  };
}

module.exports = {
  getAllToolboxes,
  getTotalToolboxes,
  createToolbox,
  getToolboxById,
  updateToolbox,
  deleteToolbox,
};
