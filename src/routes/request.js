import express from 'express';
const requestRouter = express.Router();
import { userAuth } from "../middlewares/userAuth.js";


requestRouter.post("/sendConnectionRequest",userAuth,async(req,res)=>{
const user = req.user;
console.log("Sending request")

res.send(user.firstName + " sent a connection request")
})
export default requestRouter;