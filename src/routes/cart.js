const express = require('express');
const authorize = require('../middlewares/authorize');
const cartController = require('../controllers/cart.controller');

const route = express.Router();

route.use(authorize);

route.post('/add', cartController.addItemToCart);

module.exports = route; 