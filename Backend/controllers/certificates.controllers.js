const certificateService = require("../services/certificates.service");

async function getCertificates(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const certificates = await certificateService.getAllCertificates(
      page,
      pageSize
    );
    const totalCertificates = await certificateService.getTotalCertificates();

    res.json({
      totalCertificates,
      totalPages: Math.ceil(totalCertificates / pageSize),
      currentPage: page,
      pageSize,
      data: certificates,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function getCertificateById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const certificate = await certificateService.getCertificateById(id);

    if (!certificate) {
      return res.status(404).json({ message: "Certificado no encontrado" });
    }

    res.json(certificate);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function addCertificate(req, res) {
  try {
    // Verificar que el archivo haya sido cargado
    if (!req.file) {
      return res.status(400).json({ message: "Se requiere un archivo PDF" });
    }

    // Extraer los datos del cuerpo de la solicitud
    const { type, emission_date, expiration_date, emisory_entity } = req.body;

    // Validar los campos obligatorios
    if (!type || !emission_date || !expiration_date || !emisory_entity) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // El archivo está en memoria como un buffer
    const fileBuffer = req.file.buffer;

    // Llamar al servicio para guardar los datos y el archivo en la base de datos
    const newCertificate = await certificateService.addCertificate(
      { type, emission_date, expiration_date, emisory_entity },
      fileBuffer
    );

    res.status(201).json(newCertificate);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function updateCertificate(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { type, emission_date, expiration_date, emisory_entity } = req.body;

    // Validar los campos obligatorios
    if (!type || !emission_date || !expiration_date || !emisory_entity) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Verificar si se proporciona un archivo
    const fileBuffer = req.file ? req.file.buffer : null;

    const updatedCertificate = await certificateService.updateCertificate(
      id,
      { type, emission_date, expiration_date, emisory_entity },
      fileBuffer
    );

    res.json(updatedCertificate);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function deleteCertificate(req, res) {
  try {
    const id = parseInt(req.params.id);
    const deleted = await certificateService.deleteCertificate(id);

    res.json({ message: "Certificado desactivado exitosamente" });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// Nueva función para obtener el archivo del certificado por ID
async function getCertificateFileById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const certificate = await certificateService.getCertificateById(id);

    if (!certificate || !certificate.certificate_file) {
      return res
        .status(404)
        .json({ message: "Certificado o archivo no encontrado" });
    }

    // Configurar los encabezados de la respuesta para la descarga
    res.setHeader("Content-Type", "application/pdf"); // o el tipo adecuado según el archivo
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate_${id}.pdf` // o el nombre adecuado del archivo
    );

    // Enviar el archivo como respuesta
    res.send(Buffer.from(certificate.certificate_file, "base64"));
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = {
  getCertificates,
  getCertificateById,
  addCertificate,
  updateCertificate,
  deleteCertificate,
  getCertificateFileById, // Exportamos la nueva función
};
