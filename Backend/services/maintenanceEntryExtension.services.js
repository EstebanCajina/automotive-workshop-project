const maintenanceEntryExtensionModel = require('../models/maintenanceEntryExtension.model');

async function getAllMaintenanceEntryExtensions(idMaintenanceEntry) {
  return await maintenanceEntryExtensionModel.getAllMaintenanceEntryExtensions(idMaintenanceEntry);
}

async function getMaintenanceEntryExtensionById(id) {
  return await maintenanceEntryExtensionModel.getMaintenanceEntryExtensionById(id);
}

async function addMaintenanceEntryExtension(extension) {
  return await maintenanceEntryExtensionModel.addMaintenanceEntryExtension(extension);
}

async function updateMaintenanceEntryExtension(id, extension) {
  return await maintenanceEntryExtensionModel.updateMaintenanceEntryExtension(id, extension);
}

async function deleteMaintenanceEntryExtension(id) {
  return await maintenanceEntryExtensionModel.deleteMaintenanceEntryExtension(id);
}

module.exports = { getAllMaintenanceEntryExtensions, getMaintenanceEntryExtensionById, addMaintenanceEntryExtension, updateMaintenanceEntryExtension, deleteMaintenanceEntryExtension };