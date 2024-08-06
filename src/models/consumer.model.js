import mongoose, { Schema } from "mongoose";

const consumerSchema = new Schema(
    {
        name: {
            type: String, 
            required: [true, "Name is required"],
            unique: true,
        },
        phoneNumber: {
            type: String, 
            required: [true, "Phone Number is required"],
            unique: true,
        },
        address: {
            type: String,
            required: [true, "Address is required"],
        },
        aadhar: {
            type: String,
            required: [true, "Aadhar Number is required"],
            unique: true,
        },
        dlno: {
            type: String,
            required: [true, "DL Number is required"],
            unique: true,
        },
    },
    {
        timestamps: true
    }
);

export const Consumer = mongoose.model("Visitor", consumerSchema);
