const certificateModel = require("../models/certificates.model");

async function getAllCertificates(page, pageSize) {
  try {
    const certificates = await certificateModel.getAllCertificates(
      page,
      pageSize
    );
    return certificates;
  } catch (error) {
    throw new Error("Error al obtener los certificados: " + error.message);
  }
}

async function getCertificateById(id) {
  try {
    const certificate = await certificateModel.getCertificateById(id);
    if (!certificate) {
      throw new Error("Certificado no encontrado");
    }
    return certificate;
  } catch (error) {
    throw new Error("Error al obtener el certificado: " + error.message);
  }
}

// Nuevo método para obtener el archivo de un certificado
async function getCertificateFileById(id) {
  try {
    const file = await certificateModel.getCertificateFileById(id);
    if (!file) {
      throw new Error("Archivo de certificado no encontrado");
    }
    return file;
  } catch (error) {
    throw new Error(
      "Error al obtener el archivo del certificado: " + error.message
    );
  }
}

async function addCertificate(data, fileBuffer) {
  try {
    return await certificateModel.createCertificate(data, fileBuffer);
  } catch (error) {
    throw new Error("Error al agregar el certificado: " + error.message);
  }
}

async function updateCertificate(id, data, fileBuffer) {
  try {
    return await certificateModel.updateCertificate(id, data, fileBuffer);
  } catch (error) {
    throw new Error("Error al actualizar el certificado: " + error.message);
  }
}

async function deleteCertificate(id) {
  try {
    return await certificateModel.deleteCertificate(id);
  } catch (error) {
    throw new Error("Error al eliminar el certificado: " + error.message);
  }
}

async function getTotalCertificates() {
  try {
    return await certificateModel.getTotalCertificates();
  } catch (error) {
    throw new Error(
      "Error al obtener el total de certificados: " + error.message
    );
  }
}

module.exports = {
  getAllCertificates,
  getCertificateById,
  getCertificateFileById, // Exportamos el nuevo método
  addCertificate,
  updateCertificate,
  deleteCertificate,
  getTotalCertificates,
};
