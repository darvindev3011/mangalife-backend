import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/index.js";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Invalid token" });
    }
    // Optionally, you can fetch the user from the database here if needed
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user; // Attach the user object to the request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;
