import bcrypt from "bcrypt";
import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export type UserRole = "citizen" | "authority" | "admin";

export interface IUser {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    wardId?: Types.ObjectId;
    departmentId?: Types.ObjectId;
    avatar?: string;
    points: number;
    issuesResolved: number;
}

export interface IUserMethods {
    isPasswordCorrect(password: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ["citizen", "authority", "admin"],
            default: "citizen",
        },
        wardId: {
            type: Schema.Types.ObjectId,
            ref: "Ward",
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: "Department",
        },
        avatar: {
            type: String,
            default:
                "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
        },
        points: {
            type: Number,
            default: 0,
        },
        issuesResolved: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    const user = this as HydratedDocument<IUser>;
    if (!user.isModified("password")) {
        return;
    }

    user.password = await bcrypt.hash(user.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
    return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser, UserModel>("User", userSchema);
