const express = require('express');
const authController = require('../controllers/auth.controller');
const authorize = require('../middlewares/authorize');
const { uploadSingleFile } = require('../utils/multer');

const route = express.Router();

// Register
route.post('/register', uploadSingleFile('image'), authController.register);

// Verify
route.post('/verify-email', authController.verifyEmail);

// Sign in
route.post('/sign-in', authController.signin);

// Refresh token
route.post('/refresh-token', authController.refreshToken);

//Forget password
route.post('/forget-password', authController.forgetPassword);

//Reset password
route.post('/reset-password', authController.resetPassword);

//Need authorize
route.use(authorize);

//Change password
route.post('/change-password', authController.changePassword);

route.post('/signout', authController.signout);

module.exports = route;