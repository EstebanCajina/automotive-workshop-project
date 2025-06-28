const userService = require('../services/user.services');
const path = require('path');
const fs = require('fs');

async function getUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function addUser(req, res) {
  try {
    const user = req.body;
    const userId = await userService.addUser(user);
    res.status(201).json({ message: 'Usuario agregado correctamente', userId: userId });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function getUserById(req, res) {
  try {
    const id = req.params.id;
    const user = await userService.getUserById(id);
    res.json(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function updateUser(req, res) {
  try {
    const id = req.params.id;
    const user = req.body;
    await userService.updateUser(id, user);
    res.status(202).json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function deleteUser(req, res) {
  try {
    const id = req.params.id;
    await userService.deleteUser(id);
    res.status(202).json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function loginUser(req, res) {
  try {
    const { username, password } = req.body;
    const { token } = await userService.loginUser(username, password);
    res.json({ token });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function logoutUser(req, res) {
  try {
    
    await userService.logoutUser(req.userDecod.user.id);

    res.status(202).json({ message: 'Usuario cerró sesión correctamente' });

  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function validUsername(req, res) {
  try {
    const { username } = req.params;
    const isRepeat = await userService.validUsername(username);
    res.json({ isRepeat });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function updateProfilePicture(req, res) {
  try {
    const id = req.params.id;
    const user = await userService.getUserById(id);

    if (user.profile_picture) {
      const oldPath = path.join(__dirname, '..', user.profile_picture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const profile_picture = path.join('uploads', req.file.filename);
    await userService.updateProfilePicture(id, profile_picture);
    res.status(202).json({ message: 'Imagen de perfil actualizada correctamente' });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = { getUsers, addUser, getUserById, updateUser, deleteUser, loginUser, logoutUser, validUsername, updateProfilePicture };
