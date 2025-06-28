const maintenanceEntryExtensionService = require('../services/maintenanceEntryExtension.services');

async function getMaintenanceEntryExtensions(req, res) {
  try {
    const idMaintenanceEntry = req.params.idMaintenanceEntry;    // Suponiendo que el id de la entrada de mantenimiento está en la consulta
    const extensions = await maintenanceEntryExtensionService.getAllMaintenanceEntryExtensions(idMaintenanceEntry);
    res.json(extensions);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function getMaintenanceEntryExtensionById(req, res) {
  try {
    const id = req.params.id;
    const extension = await maintenanceEntryExtensionService.getMaintenanceEntryExtensionById(id);
    if (!extension) {
      return res.status(404).send('Prórroga de entrada de mantenimiento no encontrada');
    }
    res.json(extension);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function addMaintenanceEntryExtension(req, res) {
  try {
    const extension = req.body;  // Suponiendo que la prórroga de entrada de mantenimiento está en el cuerpo de la solicitud

    if (!extension || Object.keys(extension).length === 0) {
      return res.status(400).send('Debe proporcionar una prórroga de entrada de mantenimiento.');
    }

    try {
      const extensionId = await maintenanceEntryExtensionService.addMaintenanceEntryExtension(extension);  // Llamada al servicio para agregar la prórroga de entrada de mantenimiento
      res.status(201).json({ id: extensionId, entry_id: extension.entry_id });
    } catch (err) {
      res.status(500).send(`Error al agregar prórroga de entrada de mantenimiento para la entrada con ID ${extension.entry_id}: ${err.message}`);
    }
  } catch (err) {
    res.status(500).send(err.message);  // En caso de error, mandamos el mensaje
  }
}

async function updateMaintenanceEntryExtension(req, res) {
  try {
    const id = req.params.id;
    const extension = req.body;
    await maintenanceEntryExtensionService.updateMaintenanceEntryExtension(id, extension);
    res.send('Prórroga de entrada de mantenimiento actualizada correctamente');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function deleteMaintenanceEntryExtension(req, res) {
  try {
    const id = req.params.id;
    await maintenanceEntryExtensionService.deleteMaintenanceEntryExtension(id);
    res.send('Prórroga de entrada de mantenimiento eliminada correctamente');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = { getMaintenanceEntryExtensions, getMaintenanceEntryExtensionById, addMaintenanceEntryExtension, updateMaintenanceEntryExtension, deleteMaintenanceEntryExtension };
