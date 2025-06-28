const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controllers');

const verifyToken = require('../middleware/verifyToken.middleware');
const checkRole = require('../middleware/checkRole.middleware');


router.get('/', verifyToken, checkRole(['Administrador']), maintenanceController.getMaintenances); // GET /api/maintenances:id
router.post('/',verifyToken, checkRole(['Administrador']), maintenanceController.addMaintenances);// POST /api/maintenances
router.get('/:id', verifyToken, checkRole(['Administrador']), maintenanceController.getMaintenanceById); // GET /api/maintenances:id
router.put('/:id', verifyToken, checkRole(['Administrador']), maintenanceController.updateMaintenance);// PUT /api/maintenances:id
router.delete('/:id', verifyToken, checkRole(['Administrador']), maintenanceController.deleteMaintenance);// DELETE /api/maintenances:id
router.get('/plate/:plate', verifyToken, checkRole(['Administrador']), maintenanceController.getMaintenanceByPlate); // GET /api/maintenances/plate/:id

module.exports = router;
