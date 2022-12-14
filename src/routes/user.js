const express = require('express');

const userController = require('../controllers/user.controller');
const authorize = require('../middlewares/authorize');
const restrictedTo = require('../middlewares/restrictedTo');
const { uploadSingleFile } = require('../utils/multer');
const router = express.Router();

// Get user by id
router.get('/:id', userController.getUserById);

// Get users by query
router.get('/', userController.getUsersByQuery);

// Authorize
router.use(authorize);

// Create user with admin role
router.post('/', restrictedTo('ADMIN'), uploadSingleFile('image'), userController.createUser);

// Update user details
router.patch('/update-user-detail', userController.updateUserDetail);

// Update user profile
router.patch('/update-user-profile', uploadSingleFile('image'), userController.updateUserProfileImage);

// Delete user by id
router.delete('/delete-user/:id', restrictedTo('ADMIN'), userController.deleteUserById);

module.exports = router;