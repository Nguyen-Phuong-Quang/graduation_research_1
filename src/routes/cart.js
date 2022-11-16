const express = require('express');
const authorize = require('../middlewares/authorize');
const cartController = require('../controllers/cart.controller');

const route = express.Router();

route.use(authorize);

route.delete('/delete-item/:productId', cartController.deleteItem)

route.delete('/delete', cartController.deleteCart)

route.patch('/increase-one', cartController.increaseOne);

route.patch('/decrease-one', cartController.decreaseOne);

route.post('/add', cartController.addItemToCart);

route.get('/', cartController.getCart);

module.exports = route; 