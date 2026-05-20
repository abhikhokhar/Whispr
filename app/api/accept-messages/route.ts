import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import userModel from "@/model/User";

export async function POST(request: Request){
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user = session?.user
    if(!session || !user){
        return Response.json({
            success: false,
            message: "Unauthorized",
        },{status:401})
    }
    const userId = user._id
    const { acceptingMessages } = await request.json()
    const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    {
        isAcceptingMessages: acceptingMessages
    },
    {
        new: true
    }
)
    if(!updatedUser){
        return Response.json({
            success: false,
            message: "User not found",
        },{status:404})
    }
    return Response.json({
        success: true,
        message: "Message acceptance status updated successfully",
    },{status:200})
}

export async function GET(request: Request){
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user = session?.user
    if(!session || !user){
        return Response.json({
            success: false,
            message: "Unauthorized",
        },{status:401})
    }
    const userId = user._id
    try {
        const existingUser = await userModel.findById(userId)
        if(!existingUser){
            return Response.json({
                success: false,
                message: "User not found",
            },{status:404})
        }
        return Response.json({
            success: true,
            message: "User found",
            isAcceptingMessages: existingUser.isAcceptingMessages,
        },{status:200})
    } catch (error) {
        return Response.json({
            success: false,
            message: "Error occurred while fetching user",
        },{status:500})
    }
}
