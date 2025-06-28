const scheduleModel = require("../models/schedule.model");

async function getSchedules() {
  return await scheduleModel.getSchedules();
}

async function getScheduleById(id) {
  return await scheduleModel.getScheduleById(id);
}

async function getScheduleByIdentification(identification) {
  return await scheduleModel.getScheduleByIdentification(identification);
}

async function addSchedule(schedule) {
  return await scheduleModel.addSchedule(schedule);
}

async function updateSchedule(id, schedule) {
  return await scheduleModel.updateSchedule(id, schedule);
}

async function deleteSchedule(id) {
  return await scheduleModel.deleteSchedule(id);
}

module.exports = { getSchedules, getScheduleById, getScheduleByIdentification ,addSchedule, updateSchedule, deleteSchedule };