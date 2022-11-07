const express = require('express');
const route = express.Router();
const authorize = require('../middlewares/authorize');
const productController = require('../controllers/product.controller');
const { uploadAnyFile } = require('../utils/multer');
const restrictedTo = require('../middlewares/restrictedTo');


route.use(authorize, restrictedTo('ADMIN', 'USER'));

// Update product images
route.patch('/update-product-images/:productId', uploadAnyFile(), productController.updateProductImages);

// Update product detail
route.patch('/update-product-detail/:productId', productController.updateProductDetail);

// Delete product by id
route.delete('/delete/:productId', productController.deleteProductById);

// Add new product
route.post('/add', restrictedTo('ADMIN', 'USER'), uploadAnyFile(), productController.addProduct);

module.exports = route
