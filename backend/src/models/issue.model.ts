import mongoose, { Schema, Types } from "mongoose";

export type IssueCategory =
    | "road"
    | "garbage"
    | "sewage"
    | "water"
    | "electricity";

export type IssueStatus = "open" | "resolved";

export interface IIssue {
    title: string;
    description: string;
    category: IssueCategory;
    images: string[];
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    wardId: Types.ObjectId;
    departmentId: Types.ObjectId;
    reportedBy: Types.ObjectId;
    status: IssueStatus;
    upvotes: number;
    downvotes: number;
    resolvedBy?: Types.ObjectId;
    resolvedAt?: Date;
    resolutionImages?: string[];
    resolutionFeedback?: string;
    resolutionScore?: number;
}

const issueSchema = new Schema<IIssue>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: ["road", "garbage", "sewage", "water", "electricity"],
            required: true,
            index: true,
        },
        images: {
            type: [String],
            default: [],
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        wardId: {
            type: Schema.Types.ObjectId,
            ref: "Ward",
            required: true,
            index: true,
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: true,
            index: true,
        },
        reportedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["open", "resolved"],
            default: "open",
            index: true,
        },
        upvotes: {
            type: Number,
            default: 0,
        },
        downvotes: {
            type: Number,
            default: 0,
        },
        resolvedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        resolvedAt: {
            type: Date,
        },
        resolutionImages: {
            type: [String],
            default: [],
        },
        resolutionFeedback: {
            type: String,
        },
        resolutionScore: {
            type: Number,
        },
    },
    { timestamps: true }
);

issueSchema.index({ location: "2dsphere" });

export const Issue = mongoose.model<IIssue>("Issue", issueSchema);
