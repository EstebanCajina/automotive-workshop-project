//crear el servicio de maintenanceEntry
const sql = require("mssql");

const maintenanceEntryModel = require("../models/maintenanceEntry.model");

async function getAllMaintenanceEntries(page, pageSize) {
  return await maintenanceEntryModel.getAllMaintenanceEntries(page, pageSize);
}

async function getMaintenanceEntryById(id) {
  return await maintenanceEntryModel.getMaintenanceEntryById(id);
}

async function addMaintenanceEntry(entry) {
  return await maintenanceEntryModel.addMaintenanceEntry(entry);
}

async function updateMaintenanceEntry(id, entry) {
  return await maintenanceEntryModel.updateMaintenanceEntry(id, entry);
}

async function deleteMaintenanceEntry(id) {
  return await maintenanceEntryModel.deleteMaintenanceEntry(id);
}

async function getTotalMaintenanceEntries() {
  const request = new sql.Request();
  const query = `SELECT COUNT(*) AS total FROM MaintenanceEntry WHERE is_active = 1`;
  const result = await request.query(query);
  return result.recordset[0].total;
}

module.exports = {
  getAllMaintenanceEntries,
  getMaintenanceEntryById,
  addMaintenanceEntry,
  updateMaintenanceEntry,
  deleteMaintenanceEntry,
  getTotalMaintenanceEntries,
};
