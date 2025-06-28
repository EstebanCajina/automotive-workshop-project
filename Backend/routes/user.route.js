const express = require('express');
const userController = require('../controllers/user.controllers');
const verifyToken = require('../middleware/verifyToken.middleware');
const checkRole = require('../middleware/checkRole.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Crear la carpeta 'uploads' si no existe
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuración de multer para guardar las imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${uuidv4()}-${Date.now()}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

router.get('/', verifyToken, checkRole(['Administrador']), userController.getUsers); // GET /api/users
router.post('/', verifyToken, checkRole(['Administrador']), userController.addUser); // POST /api/users
router.get('/:id', verifyToken, checkRole(['Administrador']), userController.getUserById); // GET /api/users/:id
router.put('/:id', verifyToken, checkRole(['Administrador']), userController.updateUser); // PUT /api/users/:id
router.delete('/:id', verifyToken, checkRole(['Administrador']), userController.deleteUser); // DELETE /api/users/:id
router.post('/login', userController.loginUser); // POST /api/users/login
router.post('/logout', verifyToken, userController.logoutUser); // POST /api/users/logout
router.get('/validUsername/:username', userController.validUsername); // GET /api/users/validUsername/:username
router.put('/updateProfilePicture/:id', verifyToken, upload.single('profile_picture'), userController.updateProfilePicture); // PUT /api/users/updateProfilePicture/:id

module.exports = router;
