const express = require('express');
const authRoute = require('./auth');
const userRoute = require('./user');
const productRoute = require('./product');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/product', productRoute);

module.exports = router;

