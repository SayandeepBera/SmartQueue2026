import mongoose from "mongoose";
const mongoURL = process.env.MONGO_URL;

const connectToMongo = async () =>{
    try {
        console.log("Mongo URL : ", mongoURL);
        await mongoose.connect(mongoURL);
        console.log("✅ Connected to MongoDB successfully");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
        process.exit(1); // Exit app on error
    }
}

export default connectToMongo;