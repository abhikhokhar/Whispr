import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import { NextAuthOptions } from "next-auth";
import { th } from "zod/locales";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProvider({
      id: "Credentials",
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any>{
        await dbConnect();
        try {
            const user = await userModel.findOne({
                $or: [
                    {email: credentials.identifier},
                    {username: credentials.identifier},
                ]
            })      
            if(!user){
                throw new Error("No user found with the provided email or username");
            }      
            
        } catch (error: any) {
            throw new Error("Error authorizing user",error);            
        }
      }
    }),
  ],
};
function CredentialProvider(arg0: { id: string; name: string; credentials: { email: { label: string; type: string; placeholder: string; }; password: { label: string; type: string; }; }; authorize(credentials: any): Promise<any>; }): import("next-auth/providers/index").Provider {
    throw new Error("Function not implemented.");
}

