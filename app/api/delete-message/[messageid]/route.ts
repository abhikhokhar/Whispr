import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import userModel from "@/model/User";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function DELETE(request: Request, { params }: { params: { messageid: string } }) {
    const  {messageid}  = await params
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user = session?.user
    if(!session || !user){
        return Response.json({
            success: false,
            message: "Unauthorized",
        },{status:401})
    }
    
    try{
        const updatedResult = await userModel.updateOne(
            {_id: user._id},
            {$pull: {messages: {_id: messageid}}}
        )
        if(updatedResult.modifiedCount === 0){
            return Response.json({
                success: false,
                message: "Message not found or already deleted",
            },{status:404})
        }
        return Response.json({
            success: true,
            message: "Message deleted successfully",
        },{status:200})
    }catch(error){
        console.error("Error deleting message:", error);
        return Response.json({
            success: false,
            message: "Error deleting message",
        },{status:500})
    }
}