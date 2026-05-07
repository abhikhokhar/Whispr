import {z} from "zod";

export const usernameValidation = z
    .string()
    .min(3,"Username must be of atleast 3 characters")
    .max(20,"Username must not be more than 20 charachers")
    .regex(/^[A-Za-z0-9_]+$/, "Username should not include special characters")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.email({message: "Invalid email address"}),
    password: z.string().min(6, {message: "Password must be atleast 6 characters"}),
    
})