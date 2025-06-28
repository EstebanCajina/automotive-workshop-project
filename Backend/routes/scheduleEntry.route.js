const express = require('express');
const scheduleEntryController = require('../controllers/scheduleEntry.controllers');
const verifyToken = require('../middleware/verifyToken.middleware');
const checkRole = require('../middleware/checkRole.middleware');

const router = express.Router();

router.get('/:idSchedule', verifyToken, checkRole(['Administrador']), scheduleEntryController.getScheduleEntries);
router.post('/', verifyToken, checkRole(['Administrador']), scheduleEntryController.addScheduleEntry);
router.get('/:id', verifyToken, checkRole(['Administrador']), scheduleEntryController.getScheduleEntryById);
router.put('/:id', verifyToken, checkRole(['Administrador']), scheduleEntryController.updateScheduleEntry);
router.delete('/:id', verifyToken, checkRole(['Administrador']), scheduleEntryController.deleteScheduleEntry);

module.exports = router;