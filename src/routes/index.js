const express = require('express');
const authRoute = require('./auth');
const userRoute = require('./user');
const productRoute = require('./product');
const cartRoute = require('./cart')
const categoryRoute = require('./category');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/product', productRoute);
router.use('/category', categoryRoute);
router.use('/cart', cartRoute);

module.exports = router;

