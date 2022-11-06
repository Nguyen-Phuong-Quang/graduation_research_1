const tokenTypes = require("../config/token");
const UserSchema = require("../models/UserSchema");
const apiFeatures = require("../utils/apiFeatures");
const { uploadFileCloudinary, destroyFileCloudinary } = require("../utils/cloudinary");

exports.getUserById = async (id) => {
    const user = await UserSchema.findById(id);

    if (!user)
        return {
            type: 'Error',
            message: 'No user found!',
            statusCode: 404
        }

    user.password = undefined;

    return {
        type: 'Success',
        message: 'Found!',
        statusCode: 200,
        user
    }
}

exports.findByQueryUsers = async (req) => {
    const users = await apiFeatures(req, UserSchema);

    // If no user found
    if (users.length < 1)
        return {
            type: 'Error',
            message: 'No user found!',
            statusCode: 404
        }

    return {
        type: 'Success',
        message: 'Found!',
        statusCode: 200,
        users
    }
}

exports.createUser = async (body, image) => {
    const { name, email, password, role } = body;
    let { address, companyName, phone } = body;

    // Check image required
    if (!image)
        return {
            tpye: 'Error',
            message: 'Profile image required!',
            statusCode: 400
        }

    //Check fields
    if (!address) address = '';
    if (!companyName) companyName = '';
    if (!phone) phone = '';

    if (!name || !email || !password || !role)
        return {
            type: 'Error',
            message: 'Missing fields',
            statusCode: 400
        }

    // Check email existed
    const isExistedEmail = await UserSchema.isExistedEmail(email);

    if (isExistedEmail)
        return {
            type: 'Error',
            message: 'Email is existed!',
            statusCode: 409
        };


    // Set up folder where image going to be uploaded in cloudinary
    const folderName = `Users/${name.trim().split(' ').join('-')}`;

    // Upload file to cloudinary
    const imageUploadResponse = await uploadFileCloudinary(image.buffer, folderName);

    // Create a code for verifying create account service
    const newUser = await UserSchema.create({
        name,
        email,
        password,
        role,
        companyName,
        address,
        phone,
        profileImage: imageUploadResponse.secure_url,
        profileImageId: imageUploadResponse.public_id,
        type: tokenTypes.verifyEmail
    });

    return {
        type: 'Success',
        statusCode: 201,
        message: 'Sign up successfully!',
        user: newUser
    }
}

exports.updateUserDetail = async (userId, body) => {
    const { email } = body;

    if (email) {
        const isExistedEmail = await UserSchema.isExistedEmail(email);
        if (isExistedEmail)
            return {
                type: 'Error',
                message: 'Email is existed!',
                statusCode: 409
            }
    }

    const user = await UserSchema.findByIdAndUpdate(userId, body, {
        new: true,
        runValidators: true
    })

    return {
        type: 'Success',
        message: 'Update user detail successfully',
        statusCode: 200,
        user
    }
}

exports.updateUserProfile = async (userId, newImage) => {
    const user = await UserSchema.findById(userId).select('-password');

    if (!user)
        return {
            type: 'Error',
            message: 'No user found!',
            statusCode: 404
        }

    await destroyFileCloudinary(user.profileImageId);

    // Set up folder where image going to be uploaded in cloudinary
    const folderName = `Users/${user.name.trim().split(' ').join('-')}`;

    // Upload file to cloudinary
    const imageUploadResponse = await uploadFileCloudinary(newImage.buffer, folderName);

    user.profileImage = imageUploadResponse.secure_url;
    user.profileImageId = imageUploadResponse.public_id;

    await user.save();

    return {
        type: 'Success',
        message: 'Update profile image successfully!',
        statusCode: 200,
        user
    }
}

exports.deleteUserById = async (userId) => {
    const user = await UserSchema.findByIdAndDelete(userId);

    if (!user)
        return {
            type: 'Error',
            message: 'No user found!',
            statusCode: 404
        }

    await destroyFileCloudinary(user.profileImageId);

    return {
        type: 'Success',
        message: 'Delete user successfully',
        statusCode: 200
    }
}