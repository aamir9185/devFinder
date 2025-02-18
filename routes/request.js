const express = require('express');
const requestRouter = express.Router();

requestRouter.post("/sendConnectionRequest",userAuth,async(req,res)=>{
const user = req.user;
console.log("Sending request")

res.send(user.firstName + " sent a connection request")
})
module.exports = requestRouter;