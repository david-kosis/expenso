const express = require("express");
const Workspace = require("../models/Workspace");
const authenticateToken = require("../middleware/auth");

const router = express.Router();
router.use(authenticateToken);

function safeArray(value, max = 5000) {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

router.get("/", async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ userId: req.userId }).lean();
    res.setHeader("Cache-Control", "no-store");
    return res.json({
      workspace: workspace
        ? {
            customers: workspace.customers || [],
            suppliers: workspace.suppliers || [],
            products: workspace.products || [],
            notifications: workspace.notifications || [],
          }
        : { customers: [], suppliers: [], products: [], notifications: [] },
    });
  } catch (error) {
    console.error("GET WORKSPACE ERROR:", error.message);
    return res.status(500).json({ message: "Unable to load workspace data." });
  }
});

router.put("/", async (req, res) => {
  try {
    const workspace = await Workspace.findOneAndUpdate(
      { userId: req.userId },
      {
        $set: {
          customers: safeArray(req.body.customers),
          suppliers: safeArray(req.body.suppliers),
          products: safeArray(req.body.products),
          notifications: safeArray(req.body.notifications, 100),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json({
      message: "Workspace saved.",
      workspace: {
        customers: workspace.customers || [],
        suppliers: workspace.suppliers || [],
        products: workspace.products || [],
        notifications: workspace.notifications || [],
      },
    });
  } catch (error) {
    console.error("SAVE WORKSPACE ERROR:", error.message);
    return res.status(500).json({ message: "Unable to save workspace data." });
  }
});

module.exports = router;
