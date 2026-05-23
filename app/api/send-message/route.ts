import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import {message} from "@/model/User";

export async function POST(request: Request){
    dbConnect();
    const {username, content} = await request.json()
    try {
        const user = await userModel.findOne({username})
        if(!user){
            return Response.json({
                success: false,
                message:"user not found",
            },{status: 401})
        }
        if(!user.isAcceptingMessages){
            return Response.json({
                success: false,
                message: " user is not accepting messages",
            },{status: 403})
        }
        const newMessages = {message: content, createdAt: new Date()}
        user.messages.push(newMessages as unknown as message)
        await user.save()
        return Response.json({
            success: true,
            message: "Message sent successfully",
        },{status: 200})
    } catch (error) {
        console.error("Error sending message:", error);
        return Response.json({
            success: false,
            message: "Failed to send message",
        },{status: 500})
    }
}