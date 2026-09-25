const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true, index: true },
    customers: { type: Array, default: [] },
    suppliers: { type: Array, default: [] },
    products: { type: Array, default: [] },
    notifications: { type: Array, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);
