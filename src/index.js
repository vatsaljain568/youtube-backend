import dotenv from "dotenv";
dotenv.config();


import connectDb from "./db/index.js";
connectDb();


/*
APPROACH NUMBER 1 ->

import express from "express"
const app = express();
// IIFE
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error: ",error);
            throw error
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on PORT ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("ERROR: ",error);
        throw error;
    }
})()
*/