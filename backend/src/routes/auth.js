import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
const router = Router();
const tokenFor = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
const safeUser = (u) => ({ id: u._id, name: u.name, email: u.email, targets: u.targets });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email and password are required." });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
    const normalized = email.trim().toLowerCase();
    if (await User.findOne({ email: normalized })) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name: name.trim(), email: normalized, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: tokenFor(user._id), user: safeUser(user) });
  } catch (e) { next(e); }
});
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ message: "Email or password is incorrect." });
    res.json({ token: tokenFor(user._id), user: safeUser(user) });
  } catch (e) { next(e); }
});
router.get("/me", async (req, res) => res.status(401).json({ message: "Sign in required." }));
export default router;
