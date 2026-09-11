

const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


dotenv.config();
const path = require("path");




// =====================================================
// TEST ENVIRONMENT VARIABLES
// =====================================================

console.log("EMAIL USER:", process.env.EMAIL_USER);

console.log(
  "EMAIL PASSWORD EXISTS:",
  !!process.env.EMAIL_PASSWORD
);

console.log(
  "MONGO URI EXISTS:",
  !!process.env.MONGO_URI
);


// =====================================================
// IMPORT ROUTES
// IMPORTANT: This must come AFTER dotenv.config()
// =====================================================

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");



// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
  express.json({ limit: "10mb" })
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);


// =====================================================
// AUTH ROUTES
// =====================================================

app.use(
  "/api/user",
  userRoutes
);

app.use(
  "/api/auth",
  authRoutes
);


// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.send("Backend is working!");
});


// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log(
      "✅ MongoDB connected successfully"
    );

  })
  .catch((error) => {

    console.error(
      "❌ MongoDB connection error:",
      error.message
    );

  });


// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );

});
