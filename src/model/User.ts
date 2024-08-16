import mongoose, { Schema, Document, Mongoose } from "mongoose";

export interface Message extends Document {
    content: string;
    createdAt: Date
}

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})


export interface User extends Document {
    username: string;
    email: string,
    password: string,
    verifyCode: string,
    verifyCodeExpire: Date,
    isVerifyed: boolean,
    isAcceptingMessage: boolean, //TYPES IN TS IS ALWAYS LOWER CASE
    messages: Message[]
}

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        match: [/.+\@.+\..+/, "please use a valid email address"]
    },
    password: {
        type: String,
        required: [true, "password is required"]
    },
    verifyCode: {
        type: String,
        required: [true, "verify code is required"]
    },
    verifyCodeExpire: {
        type: Date,
        required: [true, "verify code expiry is required"]
    },
    isVerifyed: {
        type: Boolean,
        default: false
    },
    isAcceptingMessage: {
        type: Boolean,
        default: true
    },
    messages: [MessageSchema]
})

const UserModel = (mongoose.models.user as mongoose.Model<User>) || mongoose.model<User>("Users", UserSchema);

export default UserModel;