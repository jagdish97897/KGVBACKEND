import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { vsp } from "../models/vsp.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";
import otpGenerator from 'otp-generator';

const registerVsp = asyncHandler(async (req, res) => {
    const { phoneNumber, email, type, name, address, city, state, pin } = req.body;

    if ([phoneNumber, email, type, name,address, city, state, pin].some(field => !field)) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await vsp.findOne({ $or: [{ email }, { phoneNumber }] });

    if (existedUser) {
        throw new ApiError(409, "User with email or phone number already exists");
    }

    const newVsp = await vsp.create({
        phoneNumber, email, type, name, address, city, state, pin
    });

    const createdVsp = await vsp.findById(newVsp._id).select("-refreshToken");

    if (!createdVsp) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdVsp, "User registered successfully")
    );
});

const sendVspOtp = asyncHandler(async (req, res, next) => {
    const phoneNumber = req.body.phoneNumber;

    if (!phoneNumber) {
        return next(new ApiError(400, "Phone number is required"));
    }

    const existedUser = await vsp.findOne({ phoneNumber });

    if (existedUser) {
        return next(new ApiError(409, "Phone number already exists"));
    }

    try {
        const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: {
                authorization: process.env.FAST2SMS_API_KEY,
                variables_values: otp,
                route: 'otp',
                numbers: phoneNumber
            }
        });
        return res.status(201).json(
            new ApiResponse(201, { otp }, "OTP sent successfully!")
        );
    } catch (error) {
        console.error('Error sending OTP:', error);
        return next(new ApiError(500, "Failed to send OTP"));
    }
});

const loginVsp = asyncHandler(async (req, res, next) => {
    const phoneNumber = req.body.phoneNumber;

    if (!phoneNumber) {
        return next(new ApiError(400, "Phone number is required"));
    }

    const user = await vsp.findOne({ phoneNumber });

    if (!user) {
        return next(new ApiError(404, "User not found"));
    }

    try {
        const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        // Save OTP to user document or to a temporary storage
        user.otp = otp;
        await user.save();

        await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: {
                authorization: process.env.FAST2SMS_API_KEY,
                variables_values: otp,
                route: 'otp',
                numbers: phoneNumber
            }
        });

        return res.status(200).json(
            new ApiResponse(200, { otp }, "OTP sent successfully!")
        );
    } catch (error) {
        console.error('Error sending OTP:', error);
        return next(new ApiError(500, "Failed to send OTP"));
    }
});

// const verifyOtp = asyncHandler(async (req, res, next) => {
//     const { phoneNumber, otp } = req.body;

//     if (!phoneNumber || !otp) {
//         return next(new ApiError(400, "Phone number and OTP are required"));
//     }

//     const user = await vsp.findOne({ phoneNumber });

//     if (!user) {
//         return next(new ApiError(404, "User not found"));
//     }

//     if (user.otp !== otp) {
//         return next(new ApiError(400, "Invalid OTP"));
//     }

//     // Clear OTP after verification
//     user.otp = undefined;
//     await user.save();

//     return res.status(200).json(
//         new ApiResponse(200, user, "OTP verified successfully, login successful!")
//     );
// });

const verifyOtp = asyncHandler(async (req, res, next) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return next(new ApiError(400, "Phone number and OTP are required"));
    }

    const user = await vsp.findOne({ phoneNumber });

    if (!user) {
        return next(new ApiError(404, "User not found"));
    }

    console.log(`Stored OTP: ${user.otp}, Provided OTP: ${otp}`);

    if (user.otp !== otp) {
        return next(new ApiError(400, "Invalid OTP"));
    }

    // Clear OTP after verification
    user.otp = undefined;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, user, "OTP verified successfully, login successful!")
    );
});


export {
    registerVsp,
    sendVspOtp,
    loginVsp,
    verifyOtp
};
