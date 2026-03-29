import mongoose, { Schema } from "mongoose";

const departmentSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { timestamps: true }
);

export const Department = mongoose.model("Department", departmentSchema);
