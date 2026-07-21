import dbConnect from "@/lib/dbConnect";
import ChatMessage from "@/model/ChatMessage";
import ChatSession from "@/model/ChatSession";

export async function GET(request: Request, {params}: {params :Promise<{chatSessionId: string}>}){
    await dbConnect()
    try {
        const {chatSessionId} = await params;
        const session = await ChatSession.findById(chatSessionId)
        if(!session){
            return Response.json({
                success: false,
                message:"session not found"
            }, {status: 404})
        }
        const messages = await ChatMessage.find({
            chatSessionId,
        }).sort({createdAt: 1})

        return Response.json({
            success:true,
            messages,
        },{status:201})

    } catch (error) {
        console.error("error fetching messages", error)
        return Response.json({
            success: false,
            message: "error fetching message"
        },{status: 500})        
    }
}