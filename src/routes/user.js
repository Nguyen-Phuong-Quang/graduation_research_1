const express = require('express');
const route = express.Router();

const userController = require('../controllers/user.controller');
const authorize = require('../middlewares/authorize');
const restrictedTo = require('../middlewares/restrictedTo');
const { uploadSingleFile } = require('../utils/multer');

// Get user by id
route.get('/:id', userController.getUser);

// Get users by query
route.get('/', userController.getUsers);

// Authorize
route.use(authorize);

// Create user with admin role
route.post('/', restrictedTo('ADMIN'), uploadSingleFile('image'), userController.createUser);

// Update user details
route.post('/update-user-detail', userController.updateUserDetail);

// Update user profile
route.post('/update-user-profile', uploadSingleFile('image'), userController.updateUserProfile);

// Delete user by id
route.delete('/delete-user/:id', restrictedTo('ADMIN'), userController.deleteUserById)
module.exports = route;