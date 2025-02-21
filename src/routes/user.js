import express from 'express';
import { userAuth } from "../middlewares/userAuth.js";  
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

export default userRouter;
