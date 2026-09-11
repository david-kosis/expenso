const express = require("express");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");
const authenticateToken = require("../middleware/auth");
const upload = require("../config/multer");

const router = express.Router();


// =====================================================
// GET CURRENT USER
// GET /api/user/me
// =====================================================

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -resetPasswordToken -resetPasswordExpires -verificationCode -verificationCodeExpires -verificationResetToken -verificationResetTokenExpires"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName || "",
        currency: user.currency || "NGN",
        profilePicture: user.profilePicture || "",
      },
    });

  } catch (error) {
    console.error("GET USER ERROR:", error);

    res.status(500).json({
      message: "Failed to load account information",
    });
  }
});


// =====================================================
// UPDATE ACCOUNT INFORMATION
// PUT /api/user/me
// =====================================================

router.put("/me", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      email,
      businessName,
      currency,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: cleanEmail,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "That email address is already in use",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = name.trim();
    user.email = cleanEmail;
    user.businessName = businessName
      ? businessName.trim()
      : "";
    user.currency = currency || "NGN";

    await user.save();

    res.json({
      message: "Account settings saved successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        currency: user.currency,
        profilePicture: user.profilePicture || "",
      },
    });

  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    res.status(500).json({
      message: "Failed to save account settings",
    });
  }
});


// =====================================================
// UPLOAD PROFILE PICTURE
// POST /api/user/profile-picture
// =====================================================

router.post(
  "/profile-picture",
  authenticateToken,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select a profile picture",
        });
      }

      const user = await User.findById(req.userId);

      if (!user) {
        // Delete uploaded file if user doesn't exist
        fs.unlinkSync(req.file.path);

        return res.status(404).json({
          message: "User not found",
        });
      }


      // ================================================
      // DELETE OLD PROFILE PICTURE
      // ================================================

      if (user.profilePicture) {
        const oldFileName = path.basename(
          user.profilePicture
        );

        const oldFilePath = path.join(
          __dirname,
          "..",
          "uploads",
          oldFileName
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }


      // ================================================
      // SAVE NEW IMAGE URL
      // ================================================

      const imageUrl =
        `/uploads/${req.file.filename}`;

      user.profilePicture = imageUrl;

      await user.save();


      res.json({
        message: "Profile picture updated successfully",

        profilePicture: imageUrl,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          businessName: user.businessName || "",
          currency: user.currency || "NGN",
          profilePicture: imageUrl,
        },
      });

    } catch (error) {
      console.error(
        "PROFILE PICTURE UPLOAD ERROR:",
        error
      );

      // Remove uploaded file if something failed
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        message: "Failed to upload profile picture",
      });
    }
  }
);


// =====================================================
// REMOVE PROFILE PICTURE
// DELETE /api/user/profile-picture
// =====================================================

router.delete(
  "/profile-picture",
  authenticateToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }


      if (user.profilePicture) {
        const fileName = path.basename(
          user.profilePicture
        );

        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          fileName
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }


      user.profilePicture = "";

      await user.save();


      res.json({
        message: "Profile picture removed successfully",
        profilePicture: "",
      });

    } catch (error) {
      console.error(
        "REMOVE PROFILE PICTURE ERROR:",
        error
      );

      res.status(500).json({
        message: "Failed to remove profile picture",
      });
    }
  }
);


module.exports = router;