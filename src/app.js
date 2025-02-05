import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { validateData } from "./utils/validation.js";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { userAuth } from "./middlewares/userAuth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/feed",userAuth ,async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: "Server Error", error });
  }
});

app.get("/profile",userAuth,async(req,res)=>{
  const user = req.user;
  res.status(200).send(user)

})

app.get("/user", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: "Server Error", error });
  }
});



app.post("/signup", async (req, res) => {
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

    // Save the new user to the database
    await user.save();

    res.status(201).send({ message: "User created successfully", user });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

app.post("/login",async(req,res)=>{
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

app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Server Error", error });
  }
});

app.patch("/user/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const ALLOWED_UPDATES = [
      "photo",
      "about",
      "gender",
      "skills",
      "password",
      "age",
    ];
    const isUpdateAllowed = Object.keys(updates).every((update) =>
      ALLOWED_UPDATES.includes(update)
    );

    if (!isUpdateAllowed) {
      return res.status(400).send({ message: "Invalid updates" });
    }

    if (updates.skills && updates.skills.length > 8) {
      return res.status(400).send({ message: "Skills cannot exceed 8" });
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send({ message: "User updated successfully", user });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .send({ message: "Validation Error", error: error.message });
    }
    res.status(500).send({ message: "Server Error", error });
  }
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port http://localhost:${PORT}`);
});
