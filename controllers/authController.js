import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";

export const register = async (req, res) => {
  try {
    const requiredFields = ['name', 'email', 'password']; // List of required fields
    const missingFields = [];

    // Loop through the required fields and check for missing ones
    requiredFields.forEach((field) => {
      if (!req.body[field]) missingFields.push(field);
    });

    // If there are missing fields, return an error response
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
        missingFields: missingFields,
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

     
    const user = await User.findOne({ email });
    if(!user){
      return res.status(400).send({
        success:false,message:"Unknown User ,User not Registered"
      })
    }
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Convert user to plain object and delete the password
    const userObject = user.toObject();
    delete userObject.password;

    // Send the response without the password field
    res.json({success:true,message:"User Login Successfully",  user: userObject,accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error logging in" });
  }
};
