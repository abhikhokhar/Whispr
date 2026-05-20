import mongoose, { Document, Schema} from "mongoose";
export interface message extends Document{
    message: string;
    createdAt: Date;
}

const messageSchema : Schema<message> = new Schema({
    message : {
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now(),
    }
})

export interface user extends Document{
    username: string,
    email: string,
    password: string,
    verifycode: string,
    isVerified: boolean,
    verifycodeexpiry: string,
    isAcceptingMessages: boolean,
    messages: message[],
}

const userSchema : Schema<user> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        unique: true,
        match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please use a valid email address"],
    },
    password:{
        type: String,
        required: [true, "Password is required"],
    },
    verifycode:{
        type: String,

    },
    verifycodeexpiry:{
        type: String,
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    isAcceptingMessages:{
        type: Boolean,
        default: true,
    },
    messages:[messageSchema],    
})

const userModel = mongoose.models.User as mongoose.Model<user> || mongoose.model<user>("User", userSchema);

export default userModel;