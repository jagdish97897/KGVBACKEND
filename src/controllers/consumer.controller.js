import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Consumer } from "../models/consumer.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import axios from "axios";
import otpGenerator from 'otp-generator';
import Razorpay from "razorpay";
import { Payment } from "../models/payment.model.js";
import crypto from "crypto";


const registerConsumer = asyncHandler(async (req, res) => {
    const { name, phoneNumber, address, aadhar, dlno } = req.body;

    // Check if any required field is missing
    if ([name, phoneNumber, address, aadhar, dlno].some((field) => !field)) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if a consumer with the same phone number, aadhar, or dlno already exists
    const existedUser = await Consumer.findOne({
        $or: [
            { phoneNumber },
            { aadhar },
            { dlno }
        ]
    });

    if (existedUser) {
        let errorMsg = '';
        if (existedUser.phoneNumber === phoneNumber) {
            errorMsg = "User with this phone number already exists";
        } else if (existedUser.aadhar === aadhar) {
            errorMsg = "User with this Aadhar number already exists";
        } else if (existedUser.dlno === dlno) {
            errorMsg = "User with this DL number already exists";
        }
        throw new ApiError(409, errorMsg);
    }

    // Create the new consumer
    const consumer = await Consumer.create({
        name, phoneNumber, address, aadhar, dlno
    });

    // Fetch the created consumer to avoid returning the refresh token
    const createdConsumer = await Consumer.findById(consumer._id).select("-refreshToken");

    if (!createdConsumer) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Return the created consumer
    return res.status(201).json(
        new ApiResponse(201, createdConsumer, "User registered successfully")
    );
});


const login = asyncHandler(async (req, res) => {
    const { name, phoneNumber } = req.body;

    if (!name || !phoneNumber) {
        throw new ApiError(400, "Both name and phone number are required");
    }

    const user = await Consumer.findOne({ name, phoneNumber });

    if (!user) {
        throw new ApiError(401, "Invalid name or phone number");
    }

    // Generate a token if you are using JWT or any other authentication mechanism
    // For simplicity, we are just returning the user details
    res.status(200).json(new ApiResponse(200, user, "Login successful"));
});
// const registerConsumer = asyncHandler(async (req, res) => {
//     const { name,phoneNumber, address, aadhar, dlno } = req.body;

//     if ([name,phoneNumber, address, aadhar, dlno].some((field) => !field)) {
//         throw new ApiError(400, "All fields are required");
//     }

//     const existedUser = await Consumer.findOne({ $or: [ { phoneNumber }] });

//     if (existedUser) {
//         throw new ApiError(409, "User with  phoneNumber already exists");
//     }

//     const consumer = await Consumer.create({
//         name,phoneNumber, address, aadhar, dlno
//     });

//     const createdConsumer = await Consumer.findById(consumer._id).select("-refreshToken");

//     if (!createdConsumer) {
//         throw new ApiError(500, "Something went wrong while registering the user");
//     }

//     return res.status(201).json(
//         new ApiResponse(200, createdConsumer, "User registered Successfully")
//     );
// });

// const loginConsumer = asyncHandler(async (req,res)=>{
//     try {
//         const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

//         const cDate = new Date();
//         const phoneNumber = req.body.phoneNumber;
//         const existedUser = await Consumer.findOne({ phoneNumber })

//     if (!existedUser) {
//         throw new ApiError(409, " phoneNumber does not exist")
//     }
//         // sent otp on mobile number
//         await axios.get('https://www.fast2sms.com/dev/bulkV2', {
//             params: {
//                 authorization: process.env.FAST2SMS_API_KEY,
//                 variables_values: otp,
//                 route: 'otp',
//                 numbers: phoneNumber
//             }
//         });

//         // console.log('sent otp')
//         return res.status(201).json(
//             new ApiResponse(201, {otp}, "OTP sent successfully!"));
//     } catch (error) {
//         console.error('Error sending OTP:', error);
//         res.status(400).json(
//             // { success: false, message: 'Failed to send OTP.' }
//             new ApiResponse(400, {error}, "Failed to send OTP")
//         );
//     }
// })

// const loginConsumer = asyncHandler(async (req, res) => {
//     try {
//         const { phoneNumber, otp } = req.body;

//         if (!otp) {
//             // Generate OTP if not provided
//             const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

//             const existedUser = await Consumer.findOne({ phoneNumber });
//             if (!existedUser) {
//                 throw new ApiError(409, "Phone number does not exist");
//             }

//             // Send OTP to mobile number
//             await axios.get('https://www.fast2sms.com/dev/bulkV2', {
//                 params: {
//                     authorization: process.env.FAST2SMS_API_KEY,
//                     variables_values: otp,
//                     route: 'otp',
//                     numbers: phoneNumber
//                 }
//             });

//             return res.status(201).json(new ApiResponse(201, { otp }, "OTP sent successfully!"));
//         } else {
//             // Validate OTP
//             const existedUser = await Consumer.findOne({ phoneNumber, otp });
//             if (!existedUser) {
//                 throw new ApiError(401, "Invalid OTP");
//             }

//             return res.status(200).json(new ApiResponse(200, {}, "Login successful!"));
//         }
//     } catch (error) {
//         console.error('Error during login:', error);
//         res.status(400).json(new ApiResponse(400, { error }, "Failed to login"));
//     }
// });


// const loginConsumer = asyncHandler(async (req, res) => {
//     try {
//         const { phoneNumber, otp } = req.body;

//         const existedUser = await Consumer.findOne({ phoneNumber });
//         if (!existedUser) {
//             throw new ApiError(409, "Phone number does not exist");
//         }

//         if (!otp) {
//             // Generate OTP if not provided
//             const generatedOtp = otpGenerator.generate(4, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

//             // Store the OTP in the user's record (in a real-world application, consider using a more secure storage)
//             existedUser.otp = generatedOtp;
//             existedUser.otpExpiry = Date.now() + 300000; // OTP valid for 5 minutes
//             await existedUser.save();

//             // Send OTP to mobile number
//             await axios.get('https://www.fast2sms.com/dev/bulkV2', {
//                 params: {
//                     authorization: process.env.FAST2SMS_API_KEY,
//                     variables_values: generatedOtp,
//                     route: 'otp',
//                     numbers: phoneNumber
//                 }
//             });

//             return res.status(201).json(new ApiResponse(201, { otp: generatedOtp }, "OTP sent successfully!"));
//         } else {
//             // Validate OTP
//             if (existedUser.otp !== otp) {
//                 throw new ApiError(401, "Invalid OTP");
//             }

//             if (Date.now() > existedUser.otpExpiry) {
//                 throw new ApiError(401, "OTP has expired");
//             }

//             // OTP is valid, clear the OTP from the user's record
//             existedUser.otp = null;
//             existedUser.otpExpiry = null;
//             await existedUser.save();

//             return res.status(200).json(new ApiResponse(200, {}, "Login successful!"));
//         }
//     } catch (error) {
//         console.error('Error during login:', error);
//         res.status(400).json(new ApiResponse(400, { error: error.message }, "Failed to login"));
//     }
// });

const loginConsumer = asyncHandler(async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        const existedUser = await Consumer.findOne({ phoneNumber });
        if (!existedUser) {
            throw new ApiError(409, "Phone number does not exist");
        }

        if (!otp) {
            // Generate OTP if not provided
            const generatedOtp = otpGenerator.generate(4, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

            // Store the OTP in the user's record (in a real-world application, consider using a more secure storage)
            existedUser.otp = generatedOtp;
            existedUser.otpExpiry = Date.now() + 300000; // OTP valid for 5 minutes
            await existedUser.save();

            console.log(`Generated OTP for ${phoneNumber}: ${generatedOtp}`); // Debugging purpose

            // Send OTP to mobile number
            await axios.get('https://www.fast2sms.com/dev/bulkV2', {
                params: {
                    authorization: process.env.FAST2SMS_API_KEY,
                    variables_values: generatedOtp,
                    route: 'otp',
                    numbers: phoneNumber
                }
            });

            return res.status(201).json(new ApiResponse(201, { otp: generatedOtp }, "OTP sent successfully!"));
        } else {
            // Validate OTP
            console.log(`Received OTP for validation: ${otp}`); // Debugging purpose
            console.log(`Stored OTP for ${phoneNumber}: ${existedUser.otp}`); // Debugging purpose

            if (existedUser.otp !== otp) {
                throw new ApiError(401, "Invalid OTP");
            }

            if (Date.now() > existedUser.otpExpiry) {
                throw new ApiError(401, "OTP has expired");
            }

            // OTP is valid, clear the OTP from the user's record
            existedUser.otp = null;
            existedUser.otpExpiry = null;
            await existedUser.save();

            return res.status(200).json(new ApiResponse(200, {}, "Login successful!"));
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(400).json(new ApiResponse(400, { error: error.message }, "Failed to login"));
    }
});

const sendConsumerOtp = asyncHandler(async (req, res) => {
    try {
        const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        const cDate = new Date();
        const phoneNumber = req.body.phoneNumber;
        const existedUser = await Consumer.findOne({ phoneNumber })

        if (existedUser) {
            throw new ApiError(409, " phoneNumber already exists")
        }
        // sent otp on mobile number
        await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: {
                authorization: process.env.FAST2SMS_API_KEY,
                variables_values: otp,
                route: 'otp',
                numbers: phoneNumber
            }
        });

        // console.log('sent otp')
        return res.status(201).json(
            new ApiResponse(201, { otp }, "OTP sent successfully!"));
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(400).json(
            // { success: false, message: 'Failed to send OTP.' }
            new ApiResponse(400, { error }, "Failed to send OTP")
        );
    }
})

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_APT_SECRET,
});

const checkout = async (req, res) => {
    const options = {
        amount: Number(req.body.amount * 100),
        currency: "INR",
        // note_key: "email sent succefully to TWCPL"

    };
    const order = await instance.orders.create(options);

    res.status(200).json({
        success: true,
        order,
    });
};

async function bookVehicle(req, res) {
    const { dlno, uploadphoto, selectkit, addons, waveamount } = req.body;

}

const paymentVerification = async (req, res) => {

    // try {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
        .update(body.toString())
        .digest("hex");


    console.log("sig received ", razorpay_signature);
    console.log("sig generated ", expectedSignature);
    const isAuthentic = razorpay_signature === expectedSignature;
    //  const isAuthentic = razorpay_order_id === razorpay_payment_id;

    console.log("payment done now checking");


    var instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_APT_SECRET })
    var response = await instance.payments.fetch(razorpay_payment_id);

    console.log(response);

    console.log(response.notes.firstname);

    if (isAuthentic) {
        const firstname = response.notes.firstname;
        const lastname = response.notes.lastname;
        const email = response.notes.email;
        const address = response.notes.address;
        const phonenumber = response.notes.phonenumber;

        // Database comes here
        await Payment.create({
            firstname,
            lastname,
            email,
            address,
            phonenumber,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        });




        // function sendEmailNotification() {

        //     // const transporter = nodemailer.createTransport({
        //     //   host: process.env.host,
        //     //   secure: false,
        //     //   port: process.env.port,
        //     //   service:process.env.service,
        //     //   auth: {
        //     //     user: process.env.user,
        //     //     pass: process.env.pass,
        //     //   },
        //     // });

        //     const transporter = nodemailer.createTransport({
        //         service: "gmail",
        //         auth: {
        //             user: "parveenprajapati9310@gmail.com", // Update with your Gmail address
        //             pass: "davajvjvmpyfjlri", // Update with your Gmail password
        //         },
        //     });



        //     const mailOptions = {
        //         from: "team@kgvl.co.in",
        //         to: "sales@kgvl.co.in",
        //         subject: "Customer booking Detail",
        //         html: `<p>New registration details:</p>
        //                 <p>Name: ${firstname}</p>
        //                  <p>Lastname: ${lastname}</p>
        //                  <p>Email: ${email}</p>
        //                  <p>Address: ${address}</p>
        //                  <p>Phone No.: ${phonenumber}</p>
        //                  <p>razorpay_order_id: ${razorpay_order_id}</p>
        //                 <p>razorpay_payment_id: ${razorpay_payment_id}</p>`,
        //     };


        //     const mailOptions1 = {
        //         from: "team@kgvl.co.in",
        //         to: email,
        //         subject: "Customer booking Detail",
        //         html: `<p>New registration details:</p>
        //                   <p>Name: ${firstname}</p>
        //                    <p>Lastname: ${lastname}</p>
        //                    <p>Email: ${email}</p>
        //                    <p>Address: ${address}</p>
        //                    <p>Phone No.: ${phonenumber}</p>
        //                    <p>razorpay_order_id: ${razorpay_order_id}</p>
        //                   <p>razorpay_payment_id: ${razorpay_payment_id}</p>`,
        //     };

        //     transporter.sendMail(mailOptions, function (error, info) {
        //         if (error) {
        //             console.log("Email error: " + error);
        //         } else {
        //             console.log("Email sent: " + info.response);
        //         }
        //     });
        //     transporter.sendMail(mailOptions1, function (error, info) {
        //         if (error) {
        //             console.log("Email error: " + error);
        //         } else {
        //             console.log("Email sent: " + info.response);
        //         }
        //     });
        // }
        // sendEmailNotification();

        // await deleteVistuserByEmail(email);
        res.redirect(
            `https://benevolent-queijadas-f11d8c.netlify.app/paymentsuccess?reference=${razorpay_payment_id}`);



    } else {

        // function sendEmailNotification() {
        //     const transporter = nodemailer.createTransport({
        //         host: "smtpout.secureserver.net",
        //         secure: false,
        //         port: 465,
        //         service: " GoDaddy",
        //         auth: {
        //             user: "team@kgvl.co.in", // Update with your Gmail address
        //             pass: "Team@12345", // Update with your Gmail password
        //         },
        //     });

        //     const mailOptions = {
        //         from: "team@kgvl.co.in",
        //         to: email,
        //         subject: "Customer booking Detail",
        //         html: `<p>New registration details:</p>
        //                        <p>payment failed</p>
        //                        <p>again try</p>`,
        //     };

        //     transporter.sendMail(mailOptions, function (error, info) {
        //         if (error) {
        //             console.log("Email error: " + error);
        //         } else {
        //             console.log("Email sent: " + info.response);
        //         }
        //     });

        // }
        // sendEmailNotification();
        res.status(400).json({ success: false, });
    }


};





export {
    registerConsumer, sendConsumerOtp, loginConsumer, login, checkout, paymentVerification
}