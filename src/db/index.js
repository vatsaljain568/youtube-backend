import mongoose from "mongoose";
import { DB_NAME } from "../contents.js";

// Approach Number 2

const connectDb = async () => {
    try {

        //yea ek object hai
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("Connected successfully : ",connectionInstance.connection.host);

    } catch (error) {
        console.log("MongoDb connection error : ",error);
        process.exit(1);
    }
}

export default connectDb;