const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const studyPlanRoutes = require("./routes/studyPlanRoutes");
const codeRoutes = require("./routes/codeRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

// Import models index to ensure all associations and table syncs are set up
require("./models");

const app = express();

// ── Security headers (helmet defaults are solid) ─────────────────────────────
app.use(helmet());

// ── CORS — only allow your frontend origin ────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. internal health checks, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));

// ── Body size limit — prevents large payload attacks ─────────────────────────
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// ── Logging (only detailed in dev) ───────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Global rate limiter — 100 req / 15 min per IP ────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again after 15 minutes." },
});
app.use(globalLimiter);

// ── Stricter limiter for auth endpoints (prevents brute force) ────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 login/signup attempts per 15 min per IP
  message: { message: "Too many auth attempts. Please wait 15 minutes before trying again." },
});

app.get("/", (req, res) => {
  res.json({
    message: "POS backend API is running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", authLimiter, userRoutes);  // auth routes get stricter limit
app.use("/api/questions", questionRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/interview", interviewRoutes);


app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  // Always log full error server-side (terminal only, never reaches browser)
  console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`);

  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    // In production: show generic message only. In dev: show actual error for debugging.
    message: isProd ? "Something went wrong. Please try again." : (err.message || "Internal server error"),
  });
});

module.exports = app;
