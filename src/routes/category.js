const express = require('express');
const authorize = require('../middlewares/authorize');
const categoryController = require('../controllers/category.controller');
const {uploadSingleFile} = require('../utils/multer');

const router = express.Router();


router.use(authorize);

router.post('/', uploadSingleFile('image'), categoryController.addCategory);

module.exports = router;