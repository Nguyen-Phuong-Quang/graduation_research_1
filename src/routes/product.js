const express = require('express');
const route = express.Router();
const authorize = require('../middlewares/authorize');
const productController = require('../controllers/product.controller');
const { uploadAnyFile } = require('../utils/multer');
const restrictedTo = require('../middlewares/restrictedTo');

// Get product by id
route.get('/:productId', productController.getProductById);

// Get all product
route.get('/', productController.getAllProducts);

route.use(authorize, restrictedTo('ADMIN', 'USER'));

// Add color and delete color
route.route('/color/:productId').post(productController.addColor).delete(productController.deleteColor);

// Add size and delete size
route.route('/size/:productId').post(productController.addSize).delete(productController.deleteSize);

// Update product images
route.patch('/update-product-images/:productId', uploadAnyFile(), productController.updateProductImages);

// Update product detail
route.patch('/update-product-detail/:productId', productController.updateProductDetail);

// Delete product by id
route.delete('/delete/:productId', productController.deleteProductById);

// Add new product
route.post('/add', restrictedTo('ADMIN', 'USER'), uploadAnyFile(), productController.addProduct);

module.exports = route
