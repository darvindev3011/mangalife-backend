import { User } from '../models/index.js';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const JWT_EXP_2 = process.env.JWT_EXP_2 || "172800000";

export const register = async (req, res) => {
  try {
    const { name, email, password, mobile, profilePicture, dob } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const encryptpassword = await bcrypt.hash(password, 10);
    if (!encryptpassword) {
      return res.status(500).json({ error: "Failed to encrypt password" });
    }
    const user = await User.create({
      name,
      email,
      password: encryptpassword,
      mobile,
      profilePicture,
      dob,
    });
    const token = jwt.sign(
      { id: user.id, email: user.email},
      JWT_SECRET,
      { expiresIn: parseInt(JWT_EXP_2) / 1000 }
    );
    delete user.dataValues.password;
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message || "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const user = await User.findOne({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    console.log('JWT_SECRET:', JWT_SECRET);
    const token = jwt.sign(
      { id: user.id, email: user.email},
      JWT_SECRET,
      { expiresIn: parseInt(JWT_EXP_2) / 1000 }
    );
    delete user.dataValues.password;
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message || "Login failed" });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.profilePicture = user.profilePicture ? `${process.env.MEDIA_URL}/avatars/${user.profilePicture}` : null;
    res.json({ profile: user });
  } catch (error) {
    res.status(500).json({ error: error.message || "Profile fetch failed" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const id  = req.user.id;
    if (!id || !req.file) {
      return res.status(400).json({ error: "User id and avatar file are required." });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    user.profilePicture = req.file.filename ? req.file.filename : null;
    await user.save();
    res.json({
      message: "Avatar uploaded successfully.",
      profilePicture: `${process.env.MEDIA_URL}/avatars/${user.profilePicture}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to upload avatar." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, mobile, dob } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (name !== undefined) user.name = name;
    if (mobile !== undefined) user.mobile = mobile;
    if (dob !== undefined) user.dob = dob;
    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update profile" });
  }
};

export default { register, login, profile, uploadAvatar, updateProfile };
