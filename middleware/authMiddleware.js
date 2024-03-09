import jwt from "jsonwebtoken";
// import User from "../model/user.js";

export const requireSignIn = async (req, res, next) => {
    try {
        const token = req.header('Authorization')
        if (!token) {
            return res.status(400).json({ message: 'Unauthorize access' })
        }
        else {
            const decode = jwt.verify(token, "ritik123");
            req.user = decode;
            next();
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}