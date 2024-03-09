// importing packages
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// importing routes
import userRouter from './routes/user.js'

const app = express();
const port = 4500;

// connecting database
const mongoDB = async () => {
    try {
        await mongoose.connect("mongodb://0.0.0.0:27017/spotify", { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("db connected")
    } catch (error) {
        console.log("db not connected", error)
    }
}

mongoDB();

// ---------------------------------->  middlewares
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));


//-----------------------------------> All routes
app.use("/api/v1", userRouter)
app.get('/', (req, res) => {
    res.send("working");
});

app.listen(port, () => {
    console.log(`listening on ${port}`);
});