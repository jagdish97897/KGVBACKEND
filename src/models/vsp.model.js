import mongoose, { Schema } from "mongoose";

const vspSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["owner", "broker"],
            required: true
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone Number is required"],
            unique: true,
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pin: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);

export const vsp = mongoose.model("vsp", vspSchema);
