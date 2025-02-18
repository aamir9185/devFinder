const express = require('express');
const profileRouter = express.Router();

profileRouter.get("/profile",userAuth,async(req,res)=>{
    const user = req.user;
    res.status(200).send(user)
  
  })

module.exports = profileRouter;