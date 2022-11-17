const express = require('express');
const authorize = require('../middlewares/authorize');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

router.use(authorize);

router.delete('/delete-item/:productId', cartController.deleteItem)

router.delete('/delete', cartController.deleteCart)

router.patch('/increase-one', cartController.increaseOne);

router.patch('/decrease-one', cartController.decreaseOne);

router.post('/add', cartController.addItemToCart);

router.get('/', cartController.getCart);

module.exports = router; 