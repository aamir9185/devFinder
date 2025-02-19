import express from 'express';
const profileRouter = express.Router();
import { userAuth } from '../middlewares/userAuth.js';
import {validateUpdate} from '../utils/validation.js'
import bcrypt from 'bcrypt';


profileRouter.get("/profile/view",userAuth,async(req,res)=>{
 try {
  const user = req.user;
  res.status(200).send(user)
 } catch (error) {
  res.status(500).send({message:"Server Error",error})
 }
   })

profileRouter.patch("/profile/edit",userAuth,async(req,res)=>{
  try {
    if(!validateUpdate(req.body)){
      return res.status(400).send({message:"Invalid update request"})
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key)=>{
      loggedInUser[key] = req.body[key]
    })

    await loggedInUser.save();

    res.send("Profile updated successfully")
    
  } catch (error) {
    res.status(500).send({message:"Server Error",error})
  }
})

profileRouter.patch("/profile/change-password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).send({ message: "Both current and new password are required" });
    }

    const user = req.user;

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).send({ message: "Password changed successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server Error", error: error.message });
  }
});

export default profileRouter;