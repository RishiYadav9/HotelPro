import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || ""
});

const makeToken = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || "development_secret_change_me",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, phone = "" } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with this email address already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
      role: "guest"
    });

    res.status(201).json({
      token: makeToken(user),
      user: safeUser(user),
      message: "Account created successfully! Welcome to HotelPro."
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({
      token: makeToken(user),
      user: safeUser(user),
      message: `Welcome back, ${user.name.split(" ")[0]}!`
    });
  } catch (e) {
    next(e);
  }
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

// PUT /api/auth/profile — Update profile details
router.put("/profile", protect, async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name?.trim()) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: safeUser(updated), message: "Profile updated successfully." });
  } catch (e) {
    next(e);
  }
});

export default router;
