import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

export const userAuth = async (req, res, next) => {

    
    try {
        const {token} = req.cookies;
        if(!token){
            return res.status(401).send({message:"Unauthenticated"})
        }
        const decodedObj = jwt.verify(token,process.env.JWT_SECRET) 
        const{id} = decodedObj;
        
        const user = await User.findById(id)

        if(!user){
            return res.status(404).send({message:"User not found"})
        }
req.user = user;
        next();

    } catch (error) {
        res.status(400).send("ERROR : " + error.message)
    }

};