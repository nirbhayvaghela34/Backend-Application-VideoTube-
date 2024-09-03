import dotenv from "dotenv";
import {app} from "./app.js";

import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log('Error: ', error);
        throw error;
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is runnnig on port ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log('Mongo db connection failed !!!',err);
});

  

/*
import express from "express";
import {DB_NAME} from "./constant.js"

const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODN_URI}/${DB_NAME}`);
        app.on("error", () => {
            console.log('Error: ', error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listen on port:  ${process.env.PORT}`);
        })
    } catch (error) {
        console.log('ERROR: ', error);
        throw error;
    }
})()
*/   