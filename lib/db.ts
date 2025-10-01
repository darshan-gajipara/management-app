import mongoose from "mongoose";

const MONGODB_URI = process.env.CONNECTION_STRING;

const connectDB = async () => {
    const connectionState = mongoose.connection.readyState;
    if (connectionState === 1) {
        console.log("Already connected");
        return;
    }
    if (connectionState === 2){
        console.log("Loading...");
        return;
    }

    try{
        mongoose.connect(MONGODB_URI!,{
            dbName:"Management_Next",
            bufferCommands:true,
        })
        console.log("MongoDB Connected.")

    } catch(error){
        console.log("MongoDB Connection Error: ", error);
        throw new Error("MongoDB Connection Error: " + (error instanceof Error ? error.message : String(error)));
    }
};

export default connectDB;