import dotenv from "dotenv";
// This is to load environment variables from a .env file into process.env
dotenv.config();


import connectDb from "./db/index.js";
// Jabh bhi ek async method complete hota hai , tabh vo ek promise return karta hai
import app from "./app.js";

connectDb()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

})
.catch((error) => {
    console.error("Database connection failed:", error);
});


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