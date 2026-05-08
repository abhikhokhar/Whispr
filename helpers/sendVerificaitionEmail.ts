import {resend} from "@/lib/resend";
import verificationEmail from "@/emails/verificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(username: string, email: string, verifycode: string): Promise<ApiResponse>{
    try {
        await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: email,
  subject: "PingMe - Your Verification Code",
  react: verificationEmail({username, otp: verifycode}),
});
        return {
            success: true,
            message: "Verification email sent successfully",
        }  
        
    } catch (emailerror) {
        console.error("Error sending verification email:", emailerror);
        return {
            success: false,
            message: "Failed to send verification email",
        }        
    }
}