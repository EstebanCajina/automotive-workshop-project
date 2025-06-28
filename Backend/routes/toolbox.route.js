const express = require("express");
const toolboxController = require("../controllers/toolbox.controller");
const verifyToken = require("../middleware/verifyToken.middleware");
const checkRole = require("../middleware/checkRole.middleware");

const router = express.Router();

// Obtener todas las cajas de herramientas activas
router.get(
  "/",
  verifyToken,
  checkRole(["Administrador"]),
  toolboxController.getAllToolboxes
); // GET /api/toolboxes

// Agregar una nueva caja de herramientas
router.post(
  "/",
  verifyToken,
  checkRole(["Administrador"]),
  toolboxController.createToolbox
); // POST /api/toolboxes

// Obtener una caja de herramientas por ID
router.get(
  "/:id",
  verifyToken,
  checkRole(["Administrador"]),
  toolboxController.getToolboxById
); // GET /api/toolboxes/:id

// Actualizar una caja de herramientas existente
router.put(
  "/:id",
  verifyToken,
  checkRole(["Administrador"]),
  toolboxController.updateToolbox
); // PUT /api/toolboxes/:id

// Eliminar (borrado lógico) una caja de herramientas
router.delete(
  "/:id",
  verifyToken,
  checkRole(["Administrador"]),
  toolboxController.deleteToolbox
); // DELETE /api/toolboxes/:id

module.exports = router;
