import express from 'express';
const authRouter = express.Router();
import { validateData } from "../utils/validation.js";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { userAuth } from "../middlewares/userAuth.js";



authRouter.post("/signup", async (req, res) => {
  try {
    await validateData(req);

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    const { firstName, lastName, email, age, gender, photo, about, skills } =
      req.body;

    // Create a new user instance
    const user = new User({
      firstName,
      lastName,
      email,
      password:hashedPassword,
      age,
      gender,
      photo,
      about,
      skills,
    });

    console.log(user);

    // Save the new user to the database
    await user.save();

    res.status(201).send({ message: "User created successfully", user });
  } catch (error) {
    res.status(400).send({ message: error.message });
    console.log(error)
  }
});

authRouter.post("/login",async(req,res)=>{
  const {email,password} = req.body;
  try {
    const user = await User.findOne({email})
    if(!user){
      throw new Error("Invalid credentials")
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
      throw new Error("Invalid credentials")
    }
    const token =  await user.getJWT();
    res.cookie("token",token)
    res.status(200).send({message:"User logged in successfully ",user})
  }catch (error) {
    res.status(400).send({ message: error.message });
  }
})

authRouter.post("/logout",userAuth,async(req,res)=>{
  res.cookie("token",null,{
    expires: new Date(Date.now()),
  })
  res.status(200).send({message:"User logged out successfully"})
})


export default authRouter;