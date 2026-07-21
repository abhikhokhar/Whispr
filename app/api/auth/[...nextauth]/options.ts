import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                identifier: { label: "username or email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await userModel.findOne({
                        $or:[
                            {email: credentials.identifier},
                            {username: credentials.identifier},
                        ]
                    })   
                    if(!user){
                        throw new Error("No user found with the provided email or username");
                    }                 
                    if(!user.isVerified){
                        throw new Error("Please verify your email before logging in");
                    }
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
                    if(isPasswordValid){
                        return user;
                    }
                    else{
                        throw new Error("Invalid password");
                    }
                    
                } catch (err) {
                throw err;                    
                }
            }
        })
    ],
    callbacks:{
    async jwt({ token, user }) {
        if(user){
            token.id = user._id;
            token.isVerified = user.isVerified;
            token.isAcceptingMessages = user.isAcceptingMessages;
            token.username = user.username;
        }
        return token
    },
    async session({ session, token }) {
        if(token){
            session.user._id = token.id
            session.user.isVerified = token.isVerified;
            session.user.isAcceptingMessages = token.isAcceptingMessages;
            session.user.username = token.username;
        }
        return session
    },
    },
    pages:{
        signIn: '/sign-in'
    },
    session:{
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
}