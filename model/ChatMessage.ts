import mongoose, { Schema } from "mongoose";

export interface ChatMessage extends Document{
    chatSessionId: mongoose.Types.ObjectId
    sender: "anonymous" | "owner"
    content: string
    seen: boolean
    createdAt: Date
}

const ChatMessageSchema: Schema<ChatMessage> = new Schema({
    chatSessionId:{
        type: Schema.Types.ObjectId,
        ref: "ChatSession",
        required: true,
    },
    sender:{
        type: String,
        enum: ["anonymous", "owner"],
        required: true,
    },
    content:{
        type: String,
        required: true,
    },
    seen:{
        type: Boolean,
        default: false,
    }
},{timestamps:true})

const ChatMessage = mongoose.models.ChatMessage || mongoose.model<ChatMessage>("ChatMessage", ChatMessageSchema)

export default ChatMessage