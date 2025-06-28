const supplierService = require('../services/supplier.services');

async function getSuppliers(req, res) {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    res.json(suppliers);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function addSupplier(req, res) {
  try {
    const supplier = req.body;
    const supplierId = await supplierService.addSupplier(supplier);
    res.status(201).json({ message: 'Proveedor agregado correctamente', supplierId });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function getSupplierById(req, res) {
  try {
    const id = req.params.id;
    const supplier = await supplierService.getSupplierById(id);
    res.json(supplier);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function updateSupplier(req, res) {
  try {
    const id = req.params.id;
    const supplier = req.body;
    await supplierService.updateSupplier(id, supplier);
    res.status(202).json({ message: 'Proveedor actualizado correctamente' });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function deleteSupplier(req, res) {
  try {
    const id = req.params.id;
    await supplierService.deleteSupplier(id);
    res.status(202).json({ message: 'Proveedor eliminado correctamente' });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function searchSuppliersByProduct(req, res) {
  try {
    const searchTerm = req.query.searchTerm; 
    if (!searchTerm) {
      return res.status(400).json({ message: "Se debe proporcionar un término de búsqueda" });
    }
    const suppliers = await supplierService.searchSuppliersByProduct(searchTerm);
    res.json(suppliers); 
  } catch (error) {
    res.status(500).send(error.message);
  }
}

module.exports = { getSuppliers, addSupplier, getSupplierById, updateSupplier, deleteSupplier, searchSuppliersByProduct };
