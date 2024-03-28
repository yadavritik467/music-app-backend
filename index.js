import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { config } from "dotenv"
import cloudinary from "cloudinary"

import userRouter from './routes/user.js'


config({ path: "./config/config.env" })
const app = express();
const port = 4500;

// connecting database
const mongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("db connected")
    } catch (error) {
        console.log("db not connected", error)
    }
}

mongoDB();
cloudinary.config({
    cloud_name: process.env.API_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})

// ---------------------------------->  middlewares
app.use(express.json({limit:"50mb"}))
app.use(express.urlencoded({limit:"50mb",extended: true}));
app.use(cors());


//-----------------------------------> All routes
app.use("/api/v1", userRouter)
app.get('/', (req, res) => {
    res.send("working");
});

app.listen(port, () => {
    console.log(`listening on ${port}`);
});
