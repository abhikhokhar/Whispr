import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import z from "zod";


const UsernameValidationSchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request){
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url)
        const queryParam = {
            username: searchParams.get("username")
        }
        const validationResult = UsernameValidationSchema.safeParse(queryParam);
        console.log("Validation result:", validationResult);
        if(!validationResult.success){
            const usernameError = validationResult.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameError?.length > 0 ? usernameError.join(", ") : "Invalid username",
            },{status: 400})
        }
        const { username } = validationResult.data;
        const existingVerifiedUser = await userModel.findOne({username, isVerified: true})
        if(existingVerifiedUser){
            return Response.json({
                success: false,
                message: "Username is already taken",
            },{status:400})
        }
        return Response.json({
            success: true,
            message: "Username is available",
        })
    } catch (error) {
        console.error("Error checking username uniqueness:", error);
        return Response.json({
            success: false,
            message: "An error occurred while checking username uniqueness. Please try again later.",
        },{status: 500})        
    }
}
