const express = require('express');
const scheduleController = require('../controllers/schedule.controllers');
const verifyToken = require('../middleware/verifyToken.middleware');
const checkRole = require('../middleware/checkRole.middleware');

const router = express.Router();

router.get('/', verifyToken, checkRole(['Administrador']), scheduleController.getSchedules);
router.post('/', verifyToken, checkRole(['Administrador']), scheduleController.addSchedule);
router.get('/:id', verifyToken, checkRole(['Administrador']), scheduleController.getScheduleById);
router.get('/identification/:identification', verifyToken, checkRole(['Administrador']), scheduleController.getScheduleByIdentification);
router.put('/:id', verifyToken, checkRole(['Administrador']), scheduleController.updateSchedule);
router.delete('/:id', verifyToken, checkRole(['Administrador']), scheduleController.deleteSchedule);

module.exports = router;