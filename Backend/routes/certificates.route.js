const express = require("express");
const certificateController = require("../controllers/certificates.controllers");
const verifyToken = require("../middleware/verifyToken.middleware");
const checkRole = require("../middleware/checkRole.middleware");
const upload = require("../middleware/upload");

const router = express.Router();

// Obtener todos los certificados
router.get(
  "/",
  verifyToken,
  checkRole(["Administrador"]),
  certificateController.getCertificates
);

// Crear un nuevo certificado
router.post(
  "/",
  verifyToken,
  checkRole(["Administrador"]),
  upload.single("certificate_file"), // Cambié 'file' por 'certificate_file'
  certificateController.addCertificate
);

// Obtener un certificado por ID
router.get(
  "/:id",
  verifyToken,
  checkRole(["Administrador"]),
  certificateController.getCertificateById
);

// Nueva ruta para descargar el archivo de un certificado por ID
router.get(
  "/:id/file",
  verifyToken,
  checkRole(["Administrador"]),
  certificateController.getCertificateFileById // Ruta para descargar el archivo
);

// Actualizar un certificado
router.put(
  "/:id",
  verifyToken,
  checkRole(["Administrador"]),
  upload.single("certificate_file"), // Cambié 'file' por 'certificate_file'
  certificateController.updateCertificate
);

// Desactivar un certificado (en lugar de eliminarlo)
router.delete(
  "/:id",
  verifyToken,
  checkRole(["Administrador"]),
  certificateController.deleteCertificate
);

module.exports = router;
