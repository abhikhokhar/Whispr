import mongoose, { Schema } from "mongoose";

export interface ChatSession extends Document{
    ownerId : mongoose.Types.ObjectId
    anonymousId: string
    anonymousName: string
    lastMessage: string
    lastMessageAt: Date
    isActive: boolean
    createdAt: Date
}

const ChatSessionSchema: Schema<ChatSession> =  new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    anonymousId:{
        type: String,
        required: true,
    },
    anonymousName:{
        type: String,
        required: true,
    },
    lastMessage:{
        type: String,
        default:"",
    },
    lastMessageAt:{
        type: Date,
        default: Date.now()
    },
    isActive:{
        type: Boolean,
        default: true
    }
},{timestamps: true})

const ChatSession = mongoose.models.ChatSession || mongoose.model<ChatSession>("ChatSession", ChatSessionSchema)

export default ChatSession