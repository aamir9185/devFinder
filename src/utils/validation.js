import validator from "validator";
import { User } from "../models/User.js"; // Make sure to import your User model

export const validateData = async ({ bodya }) => {
  const { firstName, lastName, email, password } = body;

  try {
    // Check for missing fields
    if (!firstName || !lastName || !email || !password) {
      throw new Error("Please fill all the required fields: firstName, lastName, email, password.");
    }

    // Trim and sanitize input
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    // Validate first and last name lengths
    if (trimmedFirstName.length < 2) {
      throw new Error("First name must be at least 2 characters long.");
    }
    if (trimmedLastName.length < 2) {
      throw new Error("Last name must be at least 2 characters long.");
    }

    // Validate email format
    if (!validator.isEmail(trimmedEmail)) {
      throw new Error("Invalid email format.");
    }

    // Validate password strength
    if (!validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })) {
      throw new Error("Password is weak. It must be at least 8 characters long, and include uppercase, lowercase, numbers, and symbols.");
    }

    // Check if email already exists in the database
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

  } catch (error) {
    throw new Error(error.message);
  }
};
