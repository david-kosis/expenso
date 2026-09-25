const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");
const User = require("../models/User");

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const COOKIE_NAME = "expenso_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;
const attempts = new Map();

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function cookieOptions(maxAge = SESSION_MAX_AGE) {
  const sameSite = process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === "production" ? "None" : "Lax");
  const secure = process.env.NODE_ENV === "production" || sameSite === "None";
  return `HttpOnly; Path=/;${maxAge ? ` Max-Age=${maxAge};` : ""} SameSite=${sameSite}${secure ? "; Secure" : ""}`;
}

function setSession(res, token, persistent = true) {
  const maxAge = persistent ? SESSION_MAX_AGE : null;
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; ${cookieOptions(maxAge)}`);
}

function clearSession(res) {
  const sameSite = process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === "production" ? "None" : "Lax");
  const secure = process.env.NODE_ENV === "production" || sameSite === "None";
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=${sameSite}${secure ? "; Secure" : ""}`);
}

function passwordScore(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function validPassword(password) {
  return typeof password === "string" && password.length >= 8 && password.length <= 128;
}

function tooManyAttempts(ip, email) {
  const key = `${ip}:${email}`;
  const now = Date.now();
  const current = attempts.get(key) || { count: 0, first: now };
  if (now - current.first > 15 * 60 * 1000) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  current.count += 1;
  attempts.set(key, current);
  return current.count > 8;
}

function resetAttempts(ip, email) {
  attempts.delete(`${ip}:${email}`);
}

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Expenso <onboarding@resend.dev>",
    to: [to],
    subject,
    html,
  });
  if (error) throw new Error(error.message || "Email delivery failed");
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    emailVerified: !!user.emailVerified,
    businessName: user.businessName || "",
    currency: user.currency || "NGN",
    profilePicture: user.profilePicture || "",
  };
}

function issueToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(
    { userId: String(user._id), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d", issuer: "expenso", audience: "expenso-web" }
  );
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

router.post("/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = cleanEmail(req.body.email);
    const password = req.body.password;

    if (!name || !email || !password) return res.status(400).json({ message: "Please complete all required fields." });
    if (name.length > 100) return res.status(400).json({ message: "Name is too long." });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
    if (!validPassword(password) || passwordScore(password) < 4) {
      return res.status(400).json({ message: "Use 8–128 characters with a mix of upper/lowercase letters, numbers and symbols." });
    }

    let user = await User.findOne({ email });
    if (user && user.emailVerified) return res.status(409).json({ message: "An account with this email already exists." });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(password, 12);

    if (!user) {
      user = await User.create({
        name,
        email,
        password: passwordHash,
        emailVerified: false,
        emailVerificationToken: hash(verificationToken),
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    } else {
      user.name = name;
      user.password = passwordHash;
      user.emailVerificationToken = hash(verificationToken);
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
    }

    const verificationUrl = `${FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail(
      email,
      "Verify your Expenso account",
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2>Welcome to Expenso, ${name}.</h2>
        <p>Verify your email to activate your account.</p>
        <a href="${verificationUrl}" style="display:inline-block;padding:12px 20px;background:#ef2027;color:#fff;text-decoration:none;border-radius:8px">Verify email</a>
        <p>This link expires in 24 hours.</p>
      </div>`
    );

    return res.status(201).json({
      message: "Account created. Check your email to verify your account.",
      emailVerificationRequired: true,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("SECURE REGISTER ERROR:", error.message);
    return res.status(500).json({ message: "Unable to create the account right now." });
  }
});

router.post("/login", async (req, res) => {
  const email = cleanEmail(req.body.email);
  const password = req.body.password;
  const remember = req.body.remember !== false;
  const ip = req.ip || req.socket.remoteAddress || "unknown";

  try {
    if (!email || !password) return res.status(400).json({ message: "Enter your email and password." });
    if (tooManyAttempts(ip, email)) return res.status(429).json({ message: "Too many sign-in attempts. Please wait 15 minutes and try again." });

    const user = await User.findOne({ email });
    const passwordMatch = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !passwordMatch) return res.status(401).json({ message: "Invalid email or password." });

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before signing in.",
        emailVerificationRequired: true,
        email: user.email,
      });
    }

    resetAttempts(ip, email);
    setSession(res, issueToken(user), remember);
    res.setHeader("Cache-Control", "no-store");
    return res.json({ message: "Login successful.", user: publicUser(user) });
  } catch (error) {
    console.error("SECURE LOGIN ERROR:", error.message);
    return res.status(500).json({ message: "Unable to sign in right now." });
  }
});

router.post("/logout", (req, res) => {
  clearSession(res);
  res.setHeader("Cache-Control", "no-store");
  return res.json({ message: "Signed out successfully." });
});

router.post("/resend-verification", async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user || user.emailVerified) return res.json({ message: "If that account exists, a verification email has been sent." });

    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = hash(token);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendEmail(email, "Your Expenso verification link", `<p>Verify your Expenso account:</p><p><a href="${FRONTEND_URL}/verify-email/${token}">Verify email</a></p><p>This link expires in 24 hours.</p>`);
    return res.json({ message: "If that account exists, a verification email has been sent." });
  } catch (error) {
    console.error("SECURE RESEND ERROR:", error.message);
    return res.status(500).json({ message: "Unable to send the verification email right now." });
  }
});

router.get("/verify-email/:token", async (req, res) => {
  try {
    const token = String(req.params.token || "");
    const user = await User.findOne({
      emailVerificationToken: hash(token),
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!token || !user) return res.status(400).json({ message: "This verification link is invalid or expired." });

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.json({ message: "Your email has been verified successfully.", email: user.email });
  } catch (error) {
    console.error("SECURE VERIFY ERROR:", error.message);
    return res.status(500).json({ message: "Unable to verify the email right now." });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "If an account matches that email, recovery instructions have been sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const verificationCode = crypto.randomInt(100000, 1000000).toString();

    user.resetPasswordToken = hash(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.verificationCode = hash(verificationCode);
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.verificationResetToken = null;
    user.verificationResetTokenExpires = null;
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(
      email,
      "Reset your Expenso password",
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2>Reset your Expenso password</h2>
        <p>Use the link below or the 6-digit recovery code.</p>
        <p><a href="${resetLink}">Reset password</a></p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${verificationCode}</p>
        <p>Both options expire in 15 minutes.</p>
      </div>`
    );

    return res.json({ message: "If an account matches that email, recovery instructions have been sent." });
  } catch (error) {
    console.error("SECURE FORGOT PASSWORD ERROR:", error.message);
    return res.status(500).json({ message: "Unable to start account recovery right now." });
  }
});

router.post("/verify-code", async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const code = String(req.body.code || "");

    if (!email || !/^\d{6}$/.test(code)) return res.status(400).json({ message: "Enter the 6-digit verification code." });

    const user = await User.findOne({
      email,
      verificationCode: hash(code),
      verificationCodeExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired verification code." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.verificationResetToken = hash(resetToken);
    user.verificationResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    return res.json({ message: "Verification successful.", verified: true, resetToken });
  } catch (error) {
    console.error("SECURE VERIFY CODE ERROR:", error.message);
    return res.status(500).json({ message: "Unable to verify the code right now." });
  }
});

async function resetPassword(req, res) {
  try {
    const token = String(req.params.token || req.body.resetToken || "");
    const password = req.body.password;

    if (!validPassword(password) || passwordScore(password) < 4) {
      return res.status(400).json({ message: "Use 8–128 characters with a mix of upper/lowercase letters, numbers and symbols." });
    }
    if (!token) return res.status(400).json({ message: "Reset token is required." });

    const tokenHash = hash(token);
    const user = await User.findOne({
      $or: [
        { resetPasswordToken: tokenHash, resetPasswordExpires: { $gt: new Date() } },
        { verificationResetToken: tokenHash, verificationResetTokenExpires: { $gt: new Date() } },
      ],
    });

    if (!user) return res.status(400).json({ message: "This password reset session is invalid or expired." });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.verificationResetToken = null;
    user.verificationResetTokenExpires = null;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    clearSession(res);
    return res.json({ message: "Password reset successful. Please sign in again." });
  } catch (error) {
    console.error("SECURE RESET PASSWORD ERROR:", error.message);
    return res.status(500).json({ message: "Unable to reset your password right now." });
  }
}

router.post("/reset-password", resetPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
