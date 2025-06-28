const userModel = require('../models/user.model');

async function getAllUsers() {
  return await userModel.getAllUsers();
}

async function addUser(user) {
  return await userModel.addUser(user);
}

async function getUserById(id) {
  return await userModel.getUserById(id);
}

async function updateUser(id, user) {
  return await userModel.updateUser(id, user);
}

async function deleteUser(id) {
  return await userModel.deleteUser(id);
}

async function loginUser(username, password) {
  return await userModel.loginUser(username, password);
}

async function logoutUser(id) {
  return await userModel.logoutUser(id);
}

async function validUsername(username) {
  return await userModel.validUsername(username);
}

async function updateProfilePicture(id, profile_picture) {
  return await userModel.updateProfilePicture(id, profile_picture);
}

module.exports = { getAllUsers, addUser, getUserById, updateUser, deleteUser, loginUser, logoutUser, validUsername, updateProfilePicture };

