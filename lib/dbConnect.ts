import mongoose from "mongoose";


type ConnectionObject = {
    isConnected? : number;
}

const connection : ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if(connection.isConnected){
        console.log("database already connected");
    }

    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("MONGO_URI is not defined");
        const db = await mongoose.connect(uri);
        connection.isConnected = db.connections[0].readyState;
    } catch (error) {
        console.error("Database conection failed",error);
        throw error;
    }
}

export default dbConnect;