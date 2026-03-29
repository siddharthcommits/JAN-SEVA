import mongoose, { Schema } from "mongoose";

export type VoteType = "upvote" | "downvote";

const voteSchema = new Schema(
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
        voteType: {
            type: String,
            enum: ["upvote", "downvote"],
            required: true,
        },
    },
    { timestamps: true }
);

voteSchema.index({ issueId: 1, userId: 1 }, { unique: true });

export const Vote = mongoose.model("Vote", voteSchema);
