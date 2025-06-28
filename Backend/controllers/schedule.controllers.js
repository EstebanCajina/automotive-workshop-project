const scheduleService = require('../services/schedule.services');

async function getSchedules(req, res) {
  try {
    const schedules = await scheduleService.getSchedules();
    res.json(schedules);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function getScheduleById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const schedule = await scheduleService.getScheduleById(id);
    if (!schedule) {
      return res.status(404).send('Horario no encontrado');
    }
    res.json(schedule);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function getScheduleByIdentification(req, res) {
    try {
        const identification = req.params.identification;
        const schedule = await scheduleService.getScheduleByIdentification(identification);
        if (!schedule) {
        return res.status(404).send('Horario no encontrado');
        }
        res.json(schedule);
    } catch (err) {
        res.status(500).send(err.message);
    }
    }


async function addSchedule(req, res) {
  try {
    const schedule = req.body;
    const scheduleId = await scheduleService.addSchedule(schedule);
    res.status(201).json({ id: scheduleId });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function updateSchedule(req, res) {
  try {
    const id = parseInt(req.params.id);
    const schedule = req.body;
    await scheduleService.updateSchedule(id, schedule);
    res.send('Horario actualizado correctamente');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function deleteSchedule(req, res) {
  try {
    const id = parseInt(req.params.id);
    await scheduleService.deleteSchedule(id);
    res.send('Horario eliminado correctamente');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = { getSchedules, getScheduleById, getScheduleByIdentification ,addSchedule, updateSchedule, deleteSchedule };