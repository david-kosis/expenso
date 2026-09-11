const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/User");

const router = express.Router();


/* =====================================================
   EMAIL TRANSPORTER
===================================================== */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});


/* =====================================================
   FRONTEND URL
===================================================== */

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";


/* =====================================================
   SEND VERIFICATION EMAIL
===================================================== */

async function sendVerificationEmail(
  user,
  token
) {
  const verificationLink =
    `${FRONTEND_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from:
      `"Expenso" <${process.env.EMAIL_USER}>`,

    to: user.email,

    subject:
      "Verify your Expenso email",

    html: `
      <div style="
        font-family:Arial,sans-serif;
        max-width:600px;
        margin:auto;
        padding:35px;
        color:#253452;
      ">

        <div style="
          width:48px;
          height:48px;
          background:#ef2027;
          color:white;
          border-radius:12px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:22px;
          font-weight:bold;
        ">
          E
        </div>

        <h2 style="
          color:#14213d;
          margin-top:25px;
        ">
          Verify your Expenso account
        </h2>

        <p>
          Hello ${user.name},
        </p>

        <p>
          Thanks for creating an Expenso account.
          Please verify your email address to activate
          your account.
        </p>

        <div style="
          margin:30px 0;
        ">

          <a
            href="${verificationLink}"
            style="
              display:inline-block;
              padding:14px 24px;
              background:#ef2027;
              color:#fff;
              text-decoration:none;
              border-radius:8px;
              font-weight:bold;
            "
          >
            Verify Email
          </a>

        </div>

        <p style="
          color:#667085;
          font-size:13px;
        ">
          This verification link expires in 24 hours.
        </p>

        <p style="
          color:#98a2b3;
          font-size:12px;
        ">
          If you did not create this account,
          you can safely ignore this email.
        </p>

        <p>
          — Expenso
        </p>

      </div>
    `,
  });
}


/* =====================================================
   REGISTER
===================================================== */

router.post(
  "/register",
  async (req, res) => {
    try {

      const {
        name,
        email,
        password,
      } = req.body;


      if (
        !name ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Please fill all fields",
        });
      }


      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters",
        });
      }


      const cleanEmail =
        email
          .toLowerCase()
          .trim();


      const existingUser =
        await User.findOne({
          email: cleanEmail,
        });


      if (existingUser) {
        return res.status(400).json({
        message: "User already exists",
      });
      
  // If account exists but email is not verified,
  // generate a completely new verification token.
  if (!existingUser.emailVerified) {

    const newVerificationToken =
      crypto.randomBytes(32).toString("hex");

    existingUser.emailVerificationToken =
      crypto
        .createHash("sha256")
        .update(newVerificationToken)
        .digest("hex");

    existingUser.emailVerificationExpires =
      new Date(
        Date.now() +
          24 * 60 * 60 * 1000
      );

    await existingUser.save();

    try {

      await sendVerificationEmail(
        existingUser,
        newVerificationToken
      );

      return res.status(200).json({
        message:
          "A new verification email has been sent. Please check your email.",
        emailVerificationRequired: true,
      });

    } catch (emailError) {

      console.error(
        "RESEND EMAIL ERROR:",
        emailError
      );

      return res.status(500).json({
        message:
          "Could not send the verification email.",
      });
    }
  }

  return res.status(400).json({
    message:
      "User already exists",
  });
}


      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


      const verificationToken =
        crypto
          .randomBytes(32)
          .toString("hex");


      const newUser =
        await User.create({
          name: name.trim(),

          email: cleanEmail,

          password:
            hashedPassword,

          emailVerified:
            false,

          emailVerificationToken:
            crypto
              .createHash("sha256")
              .update(
                verificationToken
              )
              .digest("hex"),

          emailVerificationExpires:
            new Date(
              Date.now() +
                24 *
                  60 *
                  60 *
                  1000
            ),
        });


      try {
  await sendVerificationEmail(
    newUser,
    verificationToken
  );

  console.log(
    "Verification email sent:",
    newUser.email
  );

} catch (emailError) {

  console.error(
    "EMAIL SEND ERROR:",
    emailError
  );

  // Do NOT delete the account.
  // The account has already been created successfully.
}
 


      console.log(
        "User registered:",
        newUser.email
      );


      return res.status(201).json({
        message:
          "Registration successful. Please check your email to verify your account.",

        emailVerificationRequired:
          true,

        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });

    } catch (error) {

      console.error(
        "REGISTRATION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Server error during registration",
      });
    }
  }
);


/* =====================================================
   RESEND VERIFICATION
===================================================== */

router.post(
  "/resend-verification",
  async (req, res) => {
    try {

      const {
        email,
      } = req.body;


      if (!email) {
        return res.status(400).json({
          message:
            "Email is required",
        });
      }


      const cleanEmail =
        email
          .toLowerCase()
          .trim();


      const user =
        await User.findOne({
          email: cleanEmail,
        });


      if (!user) {
        return res.status(404).json({
          message:
            "Account not found",
        });
      }


      if (
        user.emailVerified
      ) {
        return res.json({
          message:
            "Email is already verified",
        });
      }


      const token =
        crypto
          .randomBytes(32)
          .toString("hex");


      user.emailVerificationToken =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");


      user.emailVerificationExpires =
        new Date(
          Date.now() +
            24 *
              60 *
              60 *
              1000
        );


      await user.save();


      await sendVerificationEmail(
        user,
        token
      );


      return res.json({
        message:
          "A new verification email has been sent.",
      });

    } catch (error) {

      console.error(
        "RESEND VERIFICATION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Could not send verification email",
      });
    }
  }
);


/* =====================================================
   VERIFY EMAIL
===================================================== */

router.get(
  "/verify-email/:token",
  async (req, res) => {

    try {

      const { token } = req.params;

      console.log(
        "VERIFY TOKEN RECEIVED:",
        token
      );

      if (!token) {

        return res.status(400).json({
          message:
            "Verification token is missing.",
        });

      }


      // Hash the token received from the email
      const hashedToken =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");


      console.log(
        "HASHED TOKEN:",
        hashedToken
      );


      const user =
        await User.findOne({
          emailVerificationToken:
            hashedToken,

          emailVerificationExpires: {
            $gt: new Date(),
          },
        });


      if (!user) {

        console.log(
          "❌ NO USER FOUND FOR VERIFICATION TOKEN"
        );

        return res.status(400).json({
          message:
            "This verification link is invalid or has expired. Please request a new verification link.",
        });

      }


      // Already verified
      if (user.emailVerified) {

        return res.json({
          message:
            "Your email is already verified.",
          email:
            user.email,
        });

      }


      user.emailVerified = true;

      user.emailVerificationToken =
        null;

      user.emailVerificationExpires =
        null;


      await user.save();


      console.log(
        "✅ EMAIL VERIFIED:",
        user.email
      );


      return res.json({

        message:
          "Your email has been verified successfully.",

        email:
          user.email,

      });

    } catch (error) {

      console.error(
        "EMAIL VERIFICATION ERROR:",
        error
      );

      return res.status(500).json({

        message:
          "Unable to verify your email.",

      });

    }

  }
);


/* =====================================================
   LOGIN
===================================================== */

router.post(
  "/login",
  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;


      if (
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Please enter email and password",
        });
      }


      const cleanEmail =
        email
          .toLowerCase()
          .trim();


      const foundUser =
        await User.findOne({
          email: cleanEmail,
        });


      if (!foundUser) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }


      const passwordMatch =
        await bcrypt.compare(
          password,
          foundUser.password
        );


      if (!passwordMatch) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }


      if (
        !foundUser.emailVerified
      ) {
        return res.status(403).json({
          message:
            "Please verify your email before logging in.",
          emailVerificationRequired:
            true,
          email:
            foundUser.email,
        });
      }


      if (
        !process.env.JWT_SECRET
      ) {
        return res.status(500).json({
          message:
            "Server configuration error",
        });
      }


      const token =
        jwt.sign(
          {
            userId:
              foundUser._id,

            email:
              foundUser.email,
          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              "7d",
          }
        );


      return res.json({

        message:
          "Login successful",

        token,

        user: {
          id: foundUser._id,
          name: foundUser.name,
          email: foundUser.email,
          emailVerified:
            foundUser.emailVerified,
          businessName:
            foundUser.businessName ||
            "",
          currency:
            foundUser.currency ||
            "NGN",
          profilePicture:
            foundUser.profilePicture ||
            "",
        },

      });

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Server error during login",
      });
    }
  }
);


/* =====================================================
   FORGOT PASSWORD
===================================================== */

router.post(
  "/forgot-password",
  async (req, res) => {

    try {

      const {
        email,
      } = req.body;


      if (!email) {
        return res.status(400).json({
          message:
            "Email is required",
        });
      }


      const cleanEmail =
        email
          .toLowerCase()
          .trim();


      const user =
        await User.findOne({
          email: cleanEmail,
        });


      if (!user) {
        return res.status(404).json({
          message:
            "Incorrect email address.",
        });
      }


      const resetToken =
        crypto
          .randomBytes(32)
          .toString("hex");


      const hashedResetToken =
        crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");


      user.resetPasswordToken =
        hashedResetToken;


      user.resetPasswordExpires =
        new Date(
          Date.now() +
            15 *
              60 *
              1000
        );


      const verificationCode =
        crypto
          .randomInt(
            100000,
            1000000
          )
          .toString();


      const hashedCode =
        crypto
          .createHash("sha256")
          .update(
            verificationCode
          )
          .digest("hex");


      user.verificationCode =
        hashedCode;


      user.verificationCodeExpires =
        new Date(
          Date.now() +
            15 *
              60 *
              1000
        );


      user.verificationResetToken =
        null;

      user.verificationResetTokenExpires =
        null;


      await user.save();


      const resetLink =
        `${FRONTEND_URL}/reset-password/${resetToken}`;


      await transporter.sendMail({
        from:
          `"Expenso" <${process.env.EMAIL_USER}>`,

        to: user.email,

        subject:
          "Expenso Password Reset",

        html: `
          <div style="
            font-family:Arial;
            max-width:600px;
            margin:auto;
            padding:30px;
          ">

            <h2>
              Reset your Expenso password
            </h2>

            <p>
              Hello ${user.name},
            </p>

            <p>
              Use the button below to reset
              your password.
            </p>

            <a
              href="${resetLink}"
              style="
                display:inline-block;
                padding:13px 22px;
                background:#ef2027;
                color:white;
                text-decoration:none;
                border-radius:7px;
                font-weight:bold;
              "
            >
              Reset Password
            </a>

            <p>
              Your verification code is:
            </p>

            <div style="
              font-size:30px;
              font-weight:bold;
              letter-spacing:8px;
              padding:15px;
              text-align:center;
              background:#f7f8fc;
            ">
              ${verificationCode}
            </div>

            <p>
              Both options expire in 15 minutes.
            </p>

          </div>
        `,
      });


      return res.json({
        message:
          "Reset link and verification code sent to your email.",
      });

    } catch (error) {

      console.error(
        "FORGOT PASSWORD ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Something went wrong while sending the reset email.",
      });
    }
  }
);


/* =====================================================
   VERIFY PASSWORD RESET CODE
===================================================== */

router.post(
  "/verify-code",
  async (req, res) => {

    try {

      const {
        email,
        code,
      } = req.body;


      if (
        !email ||
        !code
      ) {
        return res.status(400).json({
          message:
            "Email and verification code are required",
        });
      }


      if (
        !/^\d{6}$/.test(code)
      ) {
        return res.status(400).json({
          message:
            "Verification code must be 6 digits",
        });
      }


      const hashedCode =
        crypto
          .createHash("sha256")
          .update(code)
          .digest("hex");


      const user =
        await User.findOne({
          email:
            email
              .toLowerCase()
              .trim(),

          verificationCode:
            hashedCode,

          verificationCodeExpires: {
            $gt: new Date(),
          },
        });


      if (!user) {
        return res.status(400).json({
          message:
            "Invalid or expired verification code",
        });
      }


      const resetToken =
        crypto
          .randomBytes(32)
          .toString("hex");


      user.verificationResetToken =
        crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");


      user.verificationResetTokenExpires =
        new Date(
          Date.now() +
            10 *
              60 *
              1000
        );


      user.verificationCode =
        null;

      user.verificationCodeExpires =
        null;


      await user.save();


      return res.json({
        message:
          "Verification successful",

        verified: true,

        resetToken,
      });

    } catch (error) {

      console.error(
        "VERIFY CODE ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while verifying code",
      });
    }
  }
);


/* =====================================================
   RESET PASSWORD
===================================================== */

const resetPasswordHandler =
  async (req, res) => {

    try {

      const {
        token,
      } = req.params;

      const {
        password,
        resetToken,
      } = req.body;


      const actualToken =
        token || resetToken;


      if (!actualToken) {
        return res.status(400).json({
          message:
            "Reset token is required",
        });
      }


      if (!password) {
        return res.status(400).json({
          message:
            "Password is required",
        });
      }


      if (
        password.length < 6
      ) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters",
        });
      }


      const hashedToken =
        crypto
          .createHash("sha256")
          .update(actualToken)
          .digest("hex");


      let user =
        await User.findOne({

          resetPasswordToken:
            hashedToken,

          resetPasswordExpires: {
            $gt: new Date(),
          },

        });


      if (!user) {

        user =
          await User.findOne({

            verificationResetToken:
              hashedToken,

            verificationResetTokenExpires: {
              $gt: new Date(),
            },

          });

      }


      if (!user) {
        return res.status(400).json({
          message:
            "Reset link or verification session is invalid or expired",
        });
      }


      user.password =
        await bcrypt.hash(
          password,
          10
        );


      user.resetPasswordToken =
        null;

      user.resetPasswordExpires =
        null;

      user.verificationCode =
        null;

      user.verificationCodeExpires =
        null;

      user.verificationResetToken =
        null;

      user.verificationResetTokenExpires =
        null;


      await user.save();


      return res.json({
        message:
          "Password reset successful",
      });

    } catch (error) {

      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while resetting password",
      });
    }
  };


router.post(
  "/reset-password/:token",
  resetPasswordHandler
);


router.post(
  "/reset-password",
  resetPasswordHandler
);


module.exports = router;