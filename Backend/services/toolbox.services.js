const sql = require("mssql");
const toolboxModel = require("../models/toolbox.model");

async function getAllToolboxes(page, pageSize) {
  return await toolboxModel.getAllToolboxes(page, pageSize);
}

async function getToolboxById(id) {
  if (!id || isNaN(id) || id < 1) {
    throw new Error("ID inválido para la caja de herramientas.");
  }
  return await toolboxModel.getToolboxById(id);
}

async function createToolbox(toolboxData) {
  if (!toolboxData.mechanic_name || !toolboxData.box_number) {
    throw new Error(
      "El nombre del mecánico y el número de caja son obligatorios."
    );
  }
  return await toolboxModel.createToolbox(toolboxData);
}

async function updateToolbox(id, toolboxData) {
  if (!id || isNaN(id) || id < 1) {
    throw new Error("ID inválido para actualizar la caja de herramientas.");
  }
  return await toolboxModel.updateToolbox(id, toolboxData);
}

async function deleteToolbox(id) {
  if (!id || isNaN(id) || id < 1) {
    throw new Error("ID inválido para eliminar la caja de herramientas.");
  }
  return await toolboxModel.deleteToolbox(id);
}

module.exports = {
  getAllToolboxes,
  getToolboxById,
  createToolbox,
  updateToolbox,
  deleteToolbox,
};
