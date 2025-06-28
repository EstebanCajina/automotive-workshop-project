const express = require('express');
const supplierController = require('../controllers/supplier.controllers');
const verifyToken = require('../middleware/verifyToken.middleware');
const checkRole = require('../middleware/checkRole.middleware');

const router = express.Router();

router.get('/', verifyToken, checkRole(['Administrador']), supplierController.getSuppliers); // GET /api/suppliers
router.post('/', verifyToken, checkRole(['Administrador']), supplierController.addSupplier); // POST /api/suppliers
router.get('/search', verifyToken, checkRole(['Administrador']), supplierController.searchSuppliersByProduct); // POST /api/suppliers/search
router.get('/:id', verifyToken, checkRole(['Administrador']), supplierController.getSupplierById); // GET /api/suppliers/:id
router.put('/:id', verifyToken, checkRole(['Administrador']), supplierController.updateSupplier); // PUT /api/suppliers/:id
router.delete('/:id', verifyToken, checkRole(['Administrador']), supplierController.deleteSupplier); // DELETE /api/suppliers/:id

module.exports = router;
