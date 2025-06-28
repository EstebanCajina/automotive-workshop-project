const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controllers'); // Controlador para vehículos
const verifyToken = require('../middleware/verifyToken.middleware');
const checkRole = require('../middleware/checkRole.middleware');

// Rutas para vehículos con verificación de token y rol
router.get('/',verifyToken, checkRole(['Administrador']),vehicleController.getVehicles); // GET /api/vehicles
router.post('/',verifyToken, checkRole(['Administrador']),vehicleController.addVehicles); // POST /api/vehicles
router.get('/:id',verifyToken, checkRole(['Administrador']),vehicleController.getVehicleById); // GET /api/vehicles/:id
router.put('/:id', verifyToken, checkRole(['Administrador']),vehicleController.updateVehicle); // PUT /api/vehicles/:id
router.delete('/:id',verifyToken, checkRole(['Administrador']),vehicleController.deleteVehicle); // DELETE /api/vehicles/:id
router.get('/check/:plate',verifyToken, checkRole(['Administrador']),vehicleController.checkPlate); // GET /api/vehicles/check/:plate
module.exports = router;
