
// ========================================
// RESET PASSWORD
// ========================================

const resetPasswordHandler = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, resetToken } = req.body;

    // If the token came from the URL, use it.
    // Otherwise use the verification reset token from the body.
    const actualToken = token || resetToken;

    if (!actualToken) {
      return res.status(400).json({
        message: "Reset token is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Hash the token before searching MongoDB
    const hashedToken = crypto
      .createHash("sha256")
      .update(actualToken)
      .digest("hex");

    // ========================================
    // CHECK RESET LINK TOKEN
    // ========================================

    let user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    });

    // ========================================
    // CHECK VERIFICATION CODE TOKEN
    // ========================================

    if (!user) {
      user = await User.findOne({
        verificationResetToken: hashedToken,
        verificationResetTokenExpires: {
          $gt: new Date(),
        },
      });
    }

    // ========================================
    // INVALID / EXPIRED TOKEN
    // ========================================

    if (!user) {
      return res.status(400).json({
        message: "Reset link or verification session is invalid or expired",
      });
    }

    // ========================================
    // HASH NEW PASSWORD
    // ========================================

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    // ========================================
    // CLEAR ALL RESET DATA
    // ========================================

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    user.verificationCode = null;
    user.verificationCodeExpires = null;

    user.verificationResetToken = null;
    user.verificationResetTokenExpires = null;

    await user.save();

    console.log("✅ Password reset successful:", user.email);

    res.json({
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("❌ RESET PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Server error while resetting password",
    });
  }
};


// ========================================
// RESET PASSWORD USING VERIFICATION CODE
// POST /api/auth/reset-password
// ========================================

router.post("/reset-password", resetPasswordHandler);


// ========================================
// RESET PASSWORD USING EMAIL LINK
// POST /api/auth/reset-password/:token
// ========================================

router.post("/reset-password/:token", resetPasswordHandler);
