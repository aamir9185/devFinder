import mongoose from "mongoose";
import validator from "validator";
const { Schema, model } = mongoose;
import dotenv from "dotenv"
dotenv.config()
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true,"First name is required"],
      minlength: 2,
    },
    lastName: {
      type: String,
      required: [true,"Last name is required"],
    },
    email: {
      type: String,
      lowerCase: true,
      required: [true,"Email is  required"],
      unique: [true,"Email already exists"],
      trim: true,
        validate(value){
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
            
        }
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'], 
        minlength: [8, 'Password must be at least 8 characters long'] 
      },
      
    age: {
      type: Number,
      min: [16,"Age must be greater than 16"],
    },
    gender: {
      type: String,
      enum: {
        values: ["M", "F", "O"],
        message: "{VALUE} is not supported for gender",
      },
      uppercase: true,
    },
    photo: {
      type: String,
      default:
        "https://st.depositphotos.com/1537427/3571/v/450/depositphotos_35717211-stock-illustration-vector-user-icon.jpg"
    },
    about: {
      type: String,
    },
    skills:{
        type: [String],
    }
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = function () {
  const user = this;

  const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{
    expiresIn:"1d"
  })

  return token;
}

export const User = model("User", userSchema);
