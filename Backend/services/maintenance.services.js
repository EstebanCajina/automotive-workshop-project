const maintenanceModel = require('../models/maintenance.model');

async function getAllMaintenances() {
  return await maintenanceModel.getAllMaintenances();
}

async function getMaintenanceByPlate(plate) {
  return await maintenanceModel.getMaintenanceByPlate(plate);
}

async function addMaintenance(maintenance) {
  return await maintenanceModel.addMaintenance(maintenance);
}

async function getMaintenanceById(id) {
  return await maintenanceModel.getMaintenanceById(id);
}

async function updateMaintenance(id, maintenance) {
  return await maintenanceModel.updateMaintenance(id, maintenance);
}

async function deleteMaintenance(id) {
  return await maintenanceModel.deleteMaintenance(id);
}

module.exports = { getAllMaintenances, getMaintenanceByPlate, addMaintenance, getMaintenanceById, updateMaintenance, deleteMaintenance };
