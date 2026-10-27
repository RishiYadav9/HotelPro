import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import roomRoutes from "./src/routes/rooms.js";
import bookingRoutes from "./src/routes/bookings.js";
import adminRoutes from "./src/routes/admin.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../frontend/dist");

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5000"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during local development testing
    }
  },
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));

// API Health Check
app.get("/api/health", (_req, res) => res.json({
  ok: true,
  service: "HotelPro API",
  timestamp: new Date().toISOString()
}));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// Serve frontend static build if present
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Error Handler
app.use((err, _req, res, _next) => {
  console.error("API Error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const port = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log("============================================================");
    console.log(`🏨 HotelPro Fullstack Platform is listening on http://localhost:${port}`);
    console.log("============================================================");
  });
}

startServer().catch((error) => {
  console.error("Server startup error:", error);
  process.exit(1);
});
