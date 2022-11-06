const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const CustomErrorHandler = require('./CustomErrorHandler');
const config = require('../config/config');

cloudinary.config({
    cloud_name: config.cloudinary.name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret
});

const createStorage = (folderName) => {
    return new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `${config.cloudinary.project}/${folderName}`
        }
    })
}

const limits = {
    fileSize: 1024 * 1024
}

const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|WEBP|webp)$/)) {
        req.fileValidationError = 'Only image files allowed!';
        return cb(
            new CustomErrorHandler(400, 'Only image files allowed!'),
            false
        )
    }

    cb(null, true);
}

// Upload single image
exports.uploadSingleFile = function (name, folderName) {
    return function (req, res, next) {

        const upload = multer({
            storage: createStorage(folderName),
            limits,
            fileFilter
        }).single(name);

        upload(req, res, err => {
            if (err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE')
                return next(new CustomErrorHandler(400, 'Only one image allowed!'));

            if (err)
                return next(new CustomErrorHandler(400, err));

            next();
        })
    }
}

// Upload any file with any name
exports.uploadAnyFile = function (folderName) {
    return function (req, res, next) {
        const upload = multer({
            storage: createStorage(folderName),
            limits,
            fileFilter
        }).any();

        upload(req, res, err => {
            if (err)
                return next(new CustomErrorHandler(500, err));

            next();
        })
    }
}

