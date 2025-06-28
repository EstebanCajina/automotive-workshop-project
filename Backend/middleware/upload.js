const multer = require("multer");

// Configuración de almacenamiento en memoria (no en disco)
const storage = multer.memoryStorage(); // Esto guarda los archivos en la memoria, no en el disco

// Aceptar solo archivos PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true); // Aceptar archivos PDF
  } else {
    cb(new Error("Solo se permiten archivos PDF"), false); // Error si no es PDF
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
