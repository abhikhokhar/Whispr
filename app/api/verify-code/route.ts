import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import { messageSchema } from "@/schemas/messageSchema";
import { success } from "zod";

export async function POST(request: Request){
    await dbConnect();
    try {
        const { username, code} = await request.json()
        const decodedUsername = decodeURIComponent(username);
        const user = await userModel.findOne({username: decodedUsername})
        if(!user){
            return Response.json({
                success: false,
                message: "User not found",
            },{status:404})
        }
        const isCodeValid = user.verifycode === code
        const isCodeNotExpired = new Date(user.verifycodeexpiry) > new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true;
            await user.save();
            return Response.json({
                success: true,
                message: "Verification successful",
            },{status:200})
        }
        else if(!isCodeValid){
            return Response.json({
                success: false,
                message: "Invalid verification code",
            },{status:400})            
        }
        else{
            return Response.json({
                success: false,
                message: "Verification code has expired",
            },{status:400})
        }
    } catch (error) {
        console.error("Error verifying code:", error);
        return Response.json({
            success: false,
            message: "An error occurred while verifying the code",
        },{status:500})
        
    }
}