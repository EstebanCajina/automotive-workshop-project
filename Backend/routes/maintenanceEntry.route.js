const express = require("express");
const maintenanceEntryController = require("../controllers/maintenanceEntry.controllers");
const verifyToken = require("../middleware/verifyToken.middleware");
const checkRole = require("../middleware/checkRole.middleware");

const router = express.Router();

router.get(
  "/",
  verifyToken,
  checkRole(["Administrador"]),
  maintenanceEntryController.getMaintenanceEntries
);
router.post(
  "/",
  verifyToken,
  checkRole(["Administrador"]),
  maintenanceEntryController.addMaintenanceEntry
);
router.get(
  "/:id",
  verifyToken,
  checkRole(["Administrador"]),
  maintenanceEntryController.getMaintenanceEntryById
);
router.put(
  "/:id",
  verifyToken,
  checkRole(["Administrador"]),
  maintenanceEntryController.updateMaintenanceEntry
);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["Administrador"]),
  maintenanceEntryController.deleteMaintenanceEntry
);

module.exports = router;
