const scheduleEntryService = require('../services/scheduleEntry.services');

async function getScheduleEntries(req, res) {
  try {
    const id = parseInt(req.params.idSchedule);

    const entries = await scheduleEntryService.getScheduleEntries(id);
    res.json(entries);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function getScheduleEntryById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const entry = await scheduleEntryService.getScheduleEntryById(id);
    if (!entry) {
      return res.status(404).send('Entrada de horario no encontrada');
    }
    res.json(entry);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function addScheduleEntry(req, res) {
  try {
    const entry = req.body;
    const entryId = await scheduleEntryService.addScheduleEntry(entry);
    res.status(201).json({ id: entryId });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function updateScheduleEntry(req, res) {
  try {
    const id = parseInt(req.params.id);
    const entry = req.body;
    await scheduleEntryService.updateScheduleEntry(id, entry);
    res.send('Entrada de horario actualizada correctamente');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function deleteScheduleEntry(req, res) {
  try {
    const id = parseInt(req.params.id);
    await scheduleEntryService.deleteScheduleEntry(id);
    res.send('Entrada de horario eliminada correctamente');
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = { getScheduleEntries, getScheduleEntryById, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry };