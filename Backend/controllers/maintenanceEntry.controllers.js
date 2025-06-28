const maintenanceEntryService = require("../services/maintenanceEntry.services");

async function getMaintenanceEntries(req, res) {
  try {
    const page = parseInt(req.query.page) || 1; // Página por defecto: 1
    const pageSize = parseInt(req.query.pageSize) || 10; // Tamaño por defecto: 10

    const entries = await maintenanceEntryService.getAllMaintenanceEntries(
      page,
      pageSize
    );
    const totalEntries =
      await maintenanceEntryService.getTotalMaintenanceEntries(); // Obtener total de registros

    res.json({
      totalEntries,
      totalPages: Math.ceil(totalEntries / pageSize),
      currentPage: page,
      pageSize,
      data: entries,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function getMaintenanceEntryById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const entry = await maintenanceEntryService.getMaintenanceEntryById(id);
    if (!entry) {
      return res.status(404).send("Entrada de mantenimiento no encontrada");
    }
    res.json(entry);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function addMaintenanceEntry(req, res) {
  try {
    const entry = req.body; // Suponiendo que la entrada de mantenimiento está en el cuerpo de la solicitud

    if (!entry || Object.keys(entry).length === 0) {
      return res
        .status(400)
        .send("Debe proporcionar una entrada de mantenimiento.");
    }

    try {
      const entryId = await maintenanceEntryService.addMaintenanceEntry(entry); // Llamada al servicio para agregar la entrada de mantenimiento
      res
        .status(201)
        .json({ id: entryId, maintenance_id: entry.maintenance_id });
    } catch (err) {
      res
        .status(500)
        .send(
          `Error al agregar entrada de mantenimiento para el mantenimiento con ID ${entry.maintenance_id}: ${err.message}`
        );
    }
  } catch (err) {
    res.status(500).send(err.message); // En caso de error, mandamos el mensaje
  }
}

async function updateMaintenanceEntry(req, res) {
  try {
    const id = req.params.id;
    const entry = req.body;
    await maintenanceEntryService.updateMaintenanceEntry(id, entry);
    res.send("Entrada de mantenimiento actualizada correctamente");
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function deleteMaintenanceEntry(req, res) {
  try {
    const id = req.params.id;
    await maintenanceEntryService.deleteMaintenanceEntry(id);
    res.send("Entrada de mantenimiento eliminada correctamente");
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = {
  getMaintenanceEntries,
  getMaintenanceEntryById,
  addMaintenanceEntry,
  updateMaintenanceEntry,
  deleteMaintenanceEntry,
};
