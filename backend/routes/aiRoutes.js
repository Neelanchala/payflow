const express = require("express");
const router = express.Router();

const { generateInsights } = require("../services/geminiService");

/* ================= AI INSIGHTS ================= */
router.post("/insights", async (req, res) => {
  try {
    const insights = await generateInsights(req.body);

    return res.json({
      success: true,
      insights
    });

  } catch (err) {
    console.error("AI ROUTE ERROR:", err.message);

    return res.status(500).json({
      success: false,
      error: err.message || "AI failed"
    });
  }
});

module.exports = router;
