const maintenanceService = require('../services/maintenance.services');

async function getMaintenances(req, res) {
  try {
    const maintenances = await maintenanceService.getAllMaintenances();
    res.json(maintenances);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function getMaintenanceByPlate(req, res) {
  try {
    const plate = req.params.plate;
    const maintenance = await maintenanceService.getMaintenanceByPlate(plate);
    if (!maintenance) {
      return res.status(404).send('Mantenimiento no encontrado');
    }
    res.json(maintenance);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function addMaintenances(req, res) {
  try {
    const maintenances = req.body;  // Suponiendo que la lista de mantenimientos está en el cuerpo de la solicitud

    if (!Array.isArray(maintenances) || maintenances.length === 0) {
      return res.status(400).send('Debe proporcionar una lista de mantenimientos.');
    }

    const responses = [];
    for (let maintenance of maintenances) {
      try {
        const maintenanceId = await maintenanceService.addMaintenance(maintenance);  // Llamada al servicio para agregar el mantenimiento
        responses.push({ id: maintenanceId, vehicle_id: maintenance.vehicle_id });
      } catch (err) {
        responses.push({ error: `Error al agregar mantenimiento para el vehículo con ID ${maintenance.vehicle_id}: ${err.message}` });
      }
    }

    res.status(201).json(responses);  // Retorna el vector de respuestas
  } catch (err) {
    res.status(500).send(err.message);  // En caso de error, mandamos el mensaje
  }
}

async function getMaintenanceById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const maintenance = await maintenanceService.getMaintenanceById(id);
    if (!maintenance) {
      return res.status(404).send('Mantenimiento no encontrado');
    }
    res.json(maintenance);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function updateMaintenance(req, res) {
  try {
    const id = parseInt(req.params.id);
    const maintenance = req.body;
    await maintenanceService.updateMaintenance(id, maintenance);
    res.send('Mantenimiento actualizado correctamente');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function deleteMaintenance(req, res) {
  try {
    const id = parseInt(req.params.id);
    await maintenanceService.deleteMaintenance(id);
    res.send('Mantenimiento eliminado correctamente');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = { getMaintenances, getMaintenanceByPlate , addMaintenances, getMaintenanceById, updateMaintenance, deleteMaintenance };
