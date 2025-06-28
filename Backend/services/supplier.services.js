const supplierModel = require('../models/supplier.model');

async function getAllSuppliers() {
  return await supplierModel.getAllSuppliers();
}

async function addSupplier(supplier) {
  return await supplierModel.addSupplier(supplier);
}

async function getSupplierById(id) {
  return await supplierModel.getSupplierById(id);
}

async function updateSupplier(id, supplier) {
  return await supplierModel.updateSupplier(id, supplier);
}

async function deleteSupplier(id) {
  return await supplierModel.deleteSupplier(id);
}

async function searchSuppliersByProduct(searchTerm) {
  return await supplierModel.searchSuppliersByProduct(searchTerm);
}

module.exports = { getAllSuppliers, addSupplier, getSupplierById, updateSupplier, deleteSupplier, searchSuppliersByProduct };
