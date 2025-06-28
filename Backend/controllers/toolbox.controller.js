const ToolboxService = require("../services/toolbox.services");

async function createToolbox(req, res) {
  try {
    const toolboxData = req.body;

    if (!toolboxData.mechanic_name || !toolboxData.box_number) {
      return res.status(400).json({
        message: "El nombre del mecánico y el número de caja son obligatorios.",
      });
    }

    const toolboxId = await ToolboxService.createToolbox(toolboxData);
    res.status(201).json({
      id: toolboxId,
      message: "Caja de herramientas creada correctamente",
    });
  } catch (error) {
    console.error("Error en la creación de caja de herramientas:", error);
    res.status(500).json({
      message: "Error al crear la caja de herramientas",
      error: error.message,
    });
  }
}

const Toolbox = require("../models/toolbox.model");

async function getAllToolboxes(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const toolboxes = await Toolbox.getAllToolboxes(page, pageSize);
    const totalToolboxes = await Toolbox.getTotalToolboxes(); // ✅ Ahora llamamos directamente al modelo

    res.status(200).json({
      totalToolboxes,
      totalPages: Math.ceil(totalToolboxes / pageSize),
      currentPage: page,
      pageSize,
      data: toolboxes, // ✅ No debe incluir otra estructura de paginación interna
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las cajas de herramientas",
      error: error.message,
    });
  }
}

module.exports = {
  getAllToolboxes,
};

async function getToolboxById(req, res) {
  try {
    const { id } = req.params;
    const toolbox = await ToolboxService.getToolboxById(id);
    if (!toolbox) {
      return res
        .status(404)
        .json({ message: "Caja de herramientas no encontrada" });
    }
    res.status(200).json(toolbox);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la caja de herramientas",
      error: error.message,
    });
  }
}

async function updateToolbox(req, res) {
  try {
    const { id } = req.params;
    const toolboxData = req.body;

    if (!toolboxData.mechanic_name || !toolboxData.box_number) {
      return res.status(400).json({
        message: "El nombre del mecánico y el número de caja son obligatorios.",
      });
    }

    await ToolboxService.updateToolbox(id, toolboxData);
    res
      .status(200)
      .json({ message: "Caja de herramientas actualizada correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar la caja de herramientas",
      error: error.message,
    });
  }
}

async function deleteToolbox(req, res) {
  try {
    const { id } = req.params;
    await ToolboxService.deleteToolbox(id);
    res
      .status(200)
      .json({ message: "Caja de herramientas eliminada correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar la caja de herramientas",
      error: error.message,
    });
  }
}

module.exports = {
  createToolbox,
  getAllToolboxes,
  getToolboxById,
  updateToolbox,
  deleteToolbox,
};
