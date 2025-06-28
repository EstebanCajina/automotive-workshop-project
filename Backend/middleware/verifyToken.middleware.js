const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
require('dotenv').config();

async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

    try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await userModel.getUserById(decoded.user.id);
  
    if (!user || user.session_token !== token) {
      return res.status(403).json({ error: 'Sesión no válida o ha iniciado sesión en otro dispositivo.' });
    }
  
    req.userDecod = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token no válido' });
  } 
}

module.exports = verifyToken;
