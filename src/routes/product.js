const express = require('express');
const route = express.Router();
const authorize = require('../middlewares/authorize');
const productController = require('../controllers/product.controller');
const { uploadAnyFile } = require('../utils/multer');
const restrictedTo = require('../middlewares/restrictedTo');

route.use(authorize);

// Update product detail
route.patch('/update-product-detail/:productId', restrictedTo('ADMIN', 'USER'), productController.updateProductDetail);

// Add new product
route.post('/add', restrictedTo('ADMIN', 'USER'), uploadAnyFile(), productController.addProduct);

module.exports = route