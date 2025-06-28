// middlewares/checkRole.js
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
require('dotenv').config();

function checkRole(allowedRoles) {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await userModel.getUserById(decoded.user.id);

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(403).json({ error: 'Token no válido' });
    }
  };
}

module.exports = checkRole;
