
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth.js";
import apiRoutes from "./src/routes/api.js";
import { protect } from "./src/middleware/auth.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));
app.use(express.json({ limit: "1mb" }));

app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }),
  authRoutes
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ATHLON API" });
});

app.use("/api", protect, apiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Server error"
  });
});

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
