import { sendVerificationEmail } from "@/helpers/sendVerificaitionEmail";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    const existingUserbyUsername = await userModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserbyUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 400 },
      );
    }
    const existingUserbyEmail = await userModel.findOne({
      email,
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
    if (existingUserbyEmail) {
      if (existingUserbyEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email already exists",
          },
          { status: 400 },
        );
      }
      else{
        //User exists but is not verified, update the existing user with new details and resend verification email
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserbyEmail.username = username
        existingUserbyEmail.password = hashedPassword
        existingUserbyEmail.verifycode = verifyCode
        existingUserbyEmail.verifycodeexpiry = new Date(Date.now()+ 3600000).toISOString()
        await existingUserbyEmail.save()
      }
    }
    else{
        //User does not exist, create a new one
        const hashedPassword = await bcrypt.hash(password, 10);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        const newUser = new userModel({
            username,
            email,
            password: hashedPassword,
            verifycode: verifyCode,
            isVerified: false,
            verifycodeexpiry: expiryDate,
            isAcceptingMessages: true,
            message: [],
        })
        await newUser.save()
    }
    //send verification email
    const emailResponse = await sendVerificationEmail(
        username,
        email,
        verifyCode
    )
    if(!emailResponse.success){
        return Response.json({
            success: false,
            message: emailResponse.message,
        },{ status: 500 })
    }
    return Response.json({
        success: true,
        message: "User registered successfully. Verification email sent.",
    })
  } catch (error) {
    console.error("Error in sign-up route:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
