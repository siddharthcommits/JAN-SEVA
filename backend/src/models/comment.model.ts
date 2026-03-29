import mongoose, { Schema, Types } from "mongoose";

export interface IComment {
    issueId: Types.ObjectId;
    userId: Types.ObjectId;
    text: string;
}

const commentSchema = new Schema<IComment>(
    {
        issueId: {
            type: Schema.Types.ObjectId,
            ref: "Issue",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
    },
    { timestamps: true }
);

export const Comment = mongoose.model<IComment>("Comment", commentSchema);
