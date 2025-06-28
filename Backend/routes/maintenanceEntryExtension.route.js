const express = require('express');
const maintenanceEntryExtensionController = require('../controllers/maintenanceEntryExtension.controllers');
const verifyToken = require('../middleware/verifyToken.middleware');
const checkRole = require('../middleware/checkRole.middleware');

const router = express.Router();

router.get('/:idMaintenanceEntry', verifyToken, checkRole(['Administrador']), maintenanceEntryExtensionController.getMaintenanceEntryExtensions);
router.post('/', verifyToken, checkRole(['Administrador']), maintenanceEntryExtensionController.addMaintenanceEntryExtension);
router.get('/:id', verifyToken, checkRole(['Administrador']), maintenanceEntryExtensionController.getMaintenanceEntryExtensionById);
router.put('/:id', verifyToken, checkRole(['Administrador']), maintenanceEntryExtensionController.updateMaintenanceEntryExtension);
router.delete('/:id', verifyToken, checkRole(['Administrador']), maintenanceEntryExtensionController.deleteMaintenanceEntryExtension);

module.exports = router;