import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// ✅ Signup
export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      profilePic: newUser.profilePic,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    console.error("Signup failed:", error);
    res.status(500).json({ message: "Signup failed" });
  }
};

// ✅ Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// ✅ Update Profile

export const updateProfile = async (req, res) => {
  try {
    const { fullname, profilePic } = req.body;
    let profilePicUrl = null;

    // ✅ Upload base64 image to Cloudinary
    if (profilePic && profilePic.startsWith("data:image")) {
      const uploadedResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "profile_pics",
      });
      profilePicUrl = uploadedResponse.secure_url;
    }

    // ✅ Prepare update object
    const updatedFields = {};
    if (fullname) updatedFields.fullname = fullname;
    if (profilePicUrl) updatedFields.profilePic = profilePicUrl;

    // ✅ Save to MongoDB
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedFields },
      { new: true }
    );

    // ✅ Return updated user
    return res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("❌ Update failed:", err);
    res.status(500).json({ message: "Update failed" });
  }
};


// ✅ Check authentication
export const checkAuth = (req, res) => {
  res.status(200).json(req.user);
};

// ✅ Logout
export const logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out" });
};
