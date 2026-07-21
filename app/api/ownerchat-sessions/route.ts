import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import ChatSession from "@/model/ChatSession";

export async function GET(){
    dbConnect()
    try {
        const session = await getServerSession(authOptions)
        if(!session || !session.user){
            return Response.json({
                seccess: false,
                message: "Unauthorized",
            },{status:404})
        }
        const userId = session.user._id
        const sessions = await ChatSession.find({
            ownerId: userId,
        }).sort({createdAt: -1})
        return Response.json({
            success: true,
            sessions
        },{status: 200})
        
    } catch (error) {
        console.error("error fetching chat sessions", error)
        return Response.json({
            success: false,
            message:"error fetching chat sessions"
        },{status: 500})        
    }
}