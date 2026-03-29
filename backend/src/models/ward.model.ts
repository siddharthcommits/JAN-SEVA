import mongoose, { Schema } from "mongoose";

const wardSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        wardNumber: {
            type: Number,
            required: true,
            min: 1,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

wardSchema.index({ city: 1, wardNumber: 1 }, { unique: true });

export const Ward = mongoose.model("Ward", wardSchema);
