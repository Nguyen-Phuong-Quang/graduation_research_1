const {
    generateAuthToken,
    verifyToken,
} = require("../middlewares/tokenHandler");
const UserSchema = require("../models/UserSchema");
const CodeSchema = require("../models/CodeSchema");
const TokenSchema = require("../models/TokenSchema");
const {
    uploadFileCloudinary,
    destroyFileCloudinary,
} = require("../utils/cloudinary");
const tokenTypes = require("../config/token");
const bcrypt = require("bcrypt");

// Sign up
exports.signup = async (body, image) => {
    const { name, email, password, role } = body;
    let { address, companyName, phone } = body;

    // Check image required
    if (!image)
        return {
            tpye: "Error",
            message: "Profile image required!",
            statusCode: 400,
        };

    //Check fields
    if (!address) address = "";
    if (!companyName) companyName = "";
    if (!phone) phone = "";

    if (!name || !email || !password || !role)
        return {
            type: "Error",
            message: "Missing fields",
            statusCode: 400,
        };

    // Check email existed
    const isExistedEmail = await UserSchema.isExistedEmail(email);

    if (isExistedEmail)
        return {
            type: "Error",
            message: "Email is existed!",
            statusCode: 409,
        };

    if (body.adminKey === "SECRET_ADMIN_KEY") {
    }
    // Admin forbidden
    else if (role === "ADMIN")
        return {
            type: "Error",
            message: "Cannot create admin!",
            statusCode: 400,
        };

    // Set up folder where image going to be uploaded in cloudinary
    const folderName = `Users/${name.trim().split(" ").join("-")}`;

    // Upload file to cloudinary
    const imageUploadResponse = await uploadFileCloudinary(
        image.buffer,
        folderName
    );

    // Create a code for verifying create account service
    await CodeSchema.create({
        name,
        email,
        password,
        role,
        companyName,
        address,
        phone,
        profileImage: imageUploadResponse.secure_url,
        profileImageId: imageUploadResponse.public_id,
        type: tokenTypes.verifyEmail,
    });

    return {
        type: "Success",
        statusCode: 201,
        message: "Sign up successfully!",
    };
};

// Verify email
exports.verifyEmail = async (verifyCode, email) => {
    // Find code in Code Schema that contain code to verify account creation
    const users = await CodeSchema.find({ email });

    // If no code exist in db (can have many codes because user can request to resend verify code)
    if (users.length === 0)
        return {
            type: "Error",
            message: "Code is expired!",
            statusCode: 404,
        };

    // Check if code is correct
    const user = users.find(async (i) => i.code === verifyCode);

    // If code is not correct
    if (!user)
        return {
            type: "Error",
            message: "Incorrect code!",
            statusCode: 400,
        };

    // Delete image in cloudinary for the another account creation not accepted
    users.forEach(async (i) => {
        if (i.code !== verifyCode)
            await destroyFileCloudinary(i.profileImageId);
    });

    // Create user
    await UserSchema.create({
        name: user.name,
        email,
        password: user.password,
        role: user.role,
        companyName: user.companyName,
        address: user.address,
        phone: user.phone,
        profileImage: user.profileImage,
        profileImageId: user.profileImageId,
    });

    // Delete verify code
    await CodeSchema.deleteMany({ email });

    return {
        type: "Success",
        message: "Verify email successfully!",
        statusCode: 201,
    };
};

// Sign in
exports.signin = async (email, password) => {
    // Check email or password is not inputted
    if (!email || !password)
        return {
            type: "Error",
            message: "Email and password required!",
            statusCode: 400,
        };

    // Check user is existed or not
    const user = await UserSchema.findOne({ email });

    //If not
    if (!user)
        return {
            type: "Error",
            message: "Email not found!",
            statusCode: 404,
        };

    // Delete token schema of previous sign in in db
    await TokenSchema.deleteMany({ userId: user._id });

    // Check password is correct or not
    const isMatchPassword = await user.isMatchPassword(password);

    // If not
    if (!isMatchPassword)
        return {
            type: "Error",
            message: "Password is wrong!",
            statusCode: 400,
        };

    // Generate token
    const token = await generateAuthToken(user);

    return {
        type: "Success",
        message: "Sign in successfully!",
        statusCode: 200,
        token,
    };
};

// Refresh token
exports.refreshToken = async (refreshToken) => {
    // Check token is expired or not
    const refreshTokenDoc = await verifyToken(refreshToken, tokenTypes.refresh);

    // If expired
    if (!refreshTokenDoc)
        return {
            type: "Error",
            message: "User token not found!",
            statusCode: 404,
        };

    // Find user of token
    const user = await UserSchema.findById(refreshTokenDoc.userId);

    // If no user found
    if (!user)
        return {
            type: "Error",
            message: "User not found!",
            statusCode: 404,
        };

    // Check refresh token expired
    if (
        (await TokenSchema.findOne({ token: refreshToken })).isExpired(
            new Date()
        )
    ) {
        await TokenSchema.deleteMany({ token: refreshToken });
        return {
            type: "Error",
            message: "This refresh token is expired!",
            statusCode: 406,
        };
    }
    // Delete token
    await TokenSchema.deleteMany({ token: refreshToken });

    // Generate new token
    const newToken = await generateAuthToken(user);

    return {
        type: "Success",
        message: "Refresh token successfully!",
        statusCode: 200,
        newToken,
    };
};

// Forget password --> ask to reset password
exports.forgetPassword = async (email) => {
    // Check if user is existed
    const user = await UserSchema.findOne({ email });

    // if not
    if (!user) {
        return {
            type: "Error",
            message: "No user found",
            statusCode: 404,
        };
    }

    // Generate code for resetting password
    const { code } = await CodeSchema.create({
        email,
        type: tokenTypes.resetPassword,
    });

    return {
        type: "Success",
        message: "Please check reset password code in email!",
        statusCode: 200,
        resetCode: code,
    };
};

// Reset password
exports.resetPassword = async (resetCode, email, password, confirmPassword) => {
    // Check code to reset password (can have many codes because user can request to resend verify code)
    const resetUserDoc = await CodeSchema.find({ email });

    // if no code found
    if (resetUserDoc.length < 1)
        return {
            type: "Error",
            message: "Expired reset process!",
            statusCode: 400,
        };

    // Check password matchs confirm password or not
    if (password !== confirmPassword)
        return {
            type: "Error",
            message: "Password does not match!",
            statusCode: 400,
        };

    // Check code is correct or not
    const check = resetUserDoc.find((i) => i.code === resetCode);

    //If not
    if (!check)
        return {
            type: "Error",
            message: "Wrong code!",
            statusCode: 400,
        };

    const user = await UserSchema.findOne({ email });

    if (!user)
        return {
            type: "Error",
            message: "No user found!",
            statusCode: 404,
        };

    if (bcrypt.compareSync(password, user.password))
        return {
            type: "Error",
            message: "Password must not be the same as the old password",
            statusCode: 400,
        };

    user.password = password;

    await user.save();

    await CodeSchema.deleteMany({ email });

    return {
        type: "Success",
        message: "Reset password successfully!",
        statusCode: 200,
    };
};

// Change password
exports.changePassword = async (
    password,
    newPassword,
    confirmPassword,
    userId
) => {
    // Check new password is match confirm password or not
    if (newPassword !== confirmPassword)
        return {
            type: "Error",
            message: "Password is not match!",
            statusCode: 400,
        };

    // Check new password is match current password or not
    if (password === newPassword)
        return {
            type: "Error",
            message: "Password and new password must not be same!",
            statusCode: 400,
        };

    //Find user in schema
    const user = await UserSchema.findById(userId);

    // Check current password is correct
    const isMatch = await user.isMatchPassword(password);

    // If not
    if (!isMatch)
        return {
            type: "Error",
            message: "Current password is not match!",
            statusCode: 400,
        };

    // Update password
    user.password = newPassword;

    // Save password
    await user.save();

    // Delete all token with old password
    await TokenSchema.deleteMany({ userId: userId });

    return {
        type: "Success",
        message: "Change password successfully!",
        statusCode: 200,
    };
};

// Sign out
exports.signout = async (userId) => {
    // Delete all sign in token
    const deleleResponse = await TokenSchema.deleteMany({ userId });

    // Check if no token found
    if (deleleResponse.deletedCount === 0)
        return {
            type: "Error",
            message: "Please login again!",
            statusCode: 400,
        };

    return {
        type: "Success",
        message: "Sign out successfully!",
        statusCode: 200,
    };
};
