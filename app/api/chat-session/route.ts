import dbConnect from "@/lib/dbConnect"
import ChatSession from "@/model/ChatSession"
import userModel from "@/model/User"

export async function POST(request: Request) {
    await dbConnect()
    try {
        const body: {
            ownerUsername: string
            anonymousId: string
            anonymousName: string
        } = await request.json()
        const { ownerUsername, anonymousId, anonymousName } = body
        const owner = await userModel.findOne({
            username: ownerUsername,
        })
        if(!owner){
            return Response.json({
                success: false,
                message: "User not found"
            },{status: 400})
        }
        const existingSession = await ChatSession.findOne({
            ownerId: owner._id,
            anonymousId,
        })
        if(existingSession){
            return Response.json({
                success: true,
                message: "Existing Session found",
                session: existingSession,
            },{status:200})
        }
        const newSession = await ChatSession.create({
            ownerId: owner._id,
            anonymousId,
            anonymousName,
        })
        return Response.json({
            success: true,
            message: "Chat Session Created",
            session: newSession
        },{status: 201})
        
    } catch (error) {
        console.log("Error in creating chat session: ", error) 
        return Response.json({
            Success: false,
            message:"error in creating chat session",
        },{status:500})       
    }
}