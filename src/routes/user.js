import express from 'express';
import { userAuth } from "../middlewares/userAuth.js";  
import { User } from '../models/User.js';
import ConnectionRequest from '../models/connectionRequest.js'; 

const userRouter = express.Router();

userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const requests = await ConnectionRequest.find({ 
        toUserId: loggedInUser._id,
        status: "interested"
    }).populate("fromUserId", "firstName lastName age gender about skills photo");  

    res.status(200).json({
      message: "Connection requests fetched successfully",
      requests
    });
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: "accepted" },
                { toUserId: loggedInUser._id, status: "accepted" }
            ]
        }).populate("fromUserId toUserId", "firstName lastName age gender about skills photo ")
        .populate("toUserId","firstName lastName age gender about skills photo")

        const data = connections.map((connection)=>{
            if(connection.fromUserId._id.equals(loggedInUser._id)){
                return connection.toUserId
            }
            return connection.fromUserId
        })

        res.status(200).json({
            message: "Connections fetched successfully",
            data})

    } catch (error) {
        res.status(500).send(error.message)
    }
})

userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;

        const skip = (page - 1) * limit;

        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId")

        const hideUserFromFeed = new Set()
        connections.forEach(connection => {
            hideUserFromFeed.add(connection.fromUserId.toString())
            hideUserFromFeed.add(connection.toUserId.toString())
        });

        const users = await User.find({
            $and : [
              {  _id: { $nin: Array.from(hideUserFromFeed) }},
                {  _id: { $ne: loggedInUser._id }}
            ]
        }).select("firstName lastName age gender about skills photo").
        skip(skip).
        limit(limit)

        res.status(200).json({
            message: "Feed fetched successfully",
            users
        })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

export default userRouter;
