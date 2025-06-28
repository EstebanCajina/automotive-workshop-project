const scheduleEntryModel = require("../models/scheduleEntry.model");

async function getScheduleEntries(id) {
  return await scheduleEntryModel.getScheduleEntries(id);
}

async function getScheduleEntryById(id) {
  return await scheduleEntryModel.getScheduleEntryById(id);
}

async function addScheduleEntry(entry) {
  return await scheduleEntryModel.addScheduleEntry(entry);
}

async function updateScheduleEntry(id, entry) {
  return await scheduleEntryModel.updateScheduleEntry(id, entry);
}

async function deleteScheduleEntry(id) {
  return await scheduleEntryModel.deleteScheduleEntry(id);
}

module.exports = { getScheduleEntries, getScheduleEntryById, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry };