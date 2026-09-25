const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/auth");
const secureAuthRoutes = require("./routes/auth-secure");
const userRoutes = require("./routes/user");
const workspaceRoutes = require("./routes/workspace");
const securityHeaders = require("./middleware/security");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(securityHeaders);

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ ok: true, service: "expenso-api" });
});

app.use("/api/user", userRoutes);
app.use("/api/workspace", workspaceRoutes);

/*
 * Secure authentication routes intentionally run before the legacy
 * authentication router. This keeps existing endpoints compatible while
 * moving login/session/recovery traffic to the hardened implementation.
 */
app.use("/api/auth", secureAuthRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Expenso API is running.");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("MongoDB connection error:", error.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Expenso API listening on port ${PORT}`));
