import express from 'express';
import { userAuth } from "../middlewares/userAuth.js";
import ConnectionRequest from "../models/connectionRequest.js";
import {User} from "../models/User.js";

const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId",userAuth,async(req,res)=>{
try {
    
    const fromUser = req.user._id;
    const toUser = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["ignore","interested"];

    if(!allowedStatus.includes(status)){
        return res.status(400).json({
            message: "Invalid status" + status
        });
    }

    const existingRequest = await ConnectionRequest.findOne({
        $or : [
            {
                fromUserId: fromUser,
                toUserId: toUser
            },
            {
                fromUserId: toUser,
                toUserId: fromUser
            }
        ]
    })

    if(existingRequest){
        return res.status(400).json({
            message: "Connection request already exists"
        });
    }

    const toUserExists =  await User.findById(toUser);
    if(!toUserExists){
        return res.status(404).json({
            message: "User not found"
        });
    }

    const connectionRequest = new ConnectionRequest({
        fromUserId: fromUser,
        toUserId: toUser,
        status: status
    });

    const data = await connectionRequest.save();

    res.status(201).json({
        message: "Connection request sent successfully",
        data
    });

} catch (error) {
    res.status(500).send(error.message)
}
})

requestRouter.post("/request/review/:status/:requestId",userAuth,async(req,res)=>{
 try {
    
   const loggedInUser = req.user
    const status = req.params.status;
    const requestId = req.params.requestId
   const allowedStatus = ["accepted","rejected"];
   if(!allowedStatus.includes(status)){
       return res.status(400).json({
           message: "Invalid status"
       });
   }   
   
   const connectionRequest = await ConnectionRequest.findOne({
         _id: requestId,
         toUserId: loggedInUser._id,
         status: "interested"
   });
   if(!connectionRequest){
       return res.status(404).json({
           message: "Connection request not found"
       });
   }
    connectionRequest.status = status;
    await connectionRequest.save();
    res.status(200).json({
        message: "Connection request reviewed successfully", 
        data: connectionRequest
    });

 } catch (error) {
    res.status(500).send(error.message)
 }
})
export default requestRouter;