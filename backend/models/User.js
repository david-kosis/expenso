const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    /* ================================================
       EMAIL VERIFICATION
    ================================================= */

    emailVerified: {
      type: Boolean,
      default: true,
    },

    emailVerificationToken: {
      type: String,
      default: null,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
    },


    /* ================================================
       BUSINESS
    ================================================= */

    businessName: {
      type: String,
      default: "",
      trim: true,
    },

    currency: {
      type: String,
      default: "NGN",
    },

    profilePicture: {
      type: String,
      default: "",
    },


    /* ================================================
       PASSWORD RESET
    ================================================= */

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },


    /* ================================================
       VERIFICATION CODE
    ================================================= */

    verificationCode: {
      type: String,
      default: null,
    },

    verificationCodeExpires: {
      type: Date,
      default: null,
    },


    /* ================================================
       TEMPORARY RESET TOKEN
    ================================================= */

    verificationResetToken: {
      type: String,
      default: null,
    },

    verificationResetTokenExpires: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);


module.exports =
  mongoose.models.User ||
  mongoose.model(
    "User",
    userSchema
  );