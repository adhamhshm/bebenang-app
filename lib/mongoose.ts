import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set("strictQuery", true);

    if (!process.env.MONGODB_URL) {
        return console.log("MONGODB_URL Not found.");
    }

    if (isConnected) {
        return console.log("Already connected to MongoDB.");
    }

    try {
        await mongoose.connect(process.env.MONGODB_URL);
        isConnected = true;
        console.log("Successfully connecting to MongoDB.");
    }
    catch (error: any) {
        console.log("Error connecting to MongoDB: " + error.message)
    }
}