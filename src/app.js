import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import cookieParser from "cookie-parser";
import { userAuth } from "./middlewares/userAuth.js";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import requestRouter from "./routes/request.js";
import userRouter from "./routes/user.js"

dotenv.config();

// ✅ Connect to database before setting up routes
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

// ✅ Middleware Debugging
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`, req.body);
  next();
});

// ✅ Fetch all users (protected route)
app.get("/feed", userAuth, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: "Server Error", error });
  }
});

// ✅ Fetch a single user (use `req.query` instead of `req.body`)
app.get("/user", async (req, res) => {
  const { email } = req.query; // ✅ Use query parameters instead
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

// ✅ Delete a user by ID
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

// ✅ Update user details
app.patch("/user/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const ALLOWED_UPDATES = ["photo", "about", "gender", "skills", "password", "age"];
    const isUpdateAllowed = Object.keys(updates).every((update) => ALLOWED_UPDATES.includes(update));

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
      return res.status(400).send({ message: "Validation Error", error: error.message });
    }
    res.status(500).send({ message: "Server Error", error });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
