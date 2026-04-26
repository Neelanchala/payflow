const express = require("express");
const router = express.Router();

const { generateInsights } = require("../services/geminiService");

/* ================= AI INSIGHTS ================= */
router.post("/insights", async (req, res) => {
try {
const data = req.body;

```
// ✅ Strong validation
if (!data || Object.keys(data).length === 0) {
  return res.status(400).json({
    success: false,
    error: "No data provided"
  });
}

const insights = await generateInsights(data);

return res.json({
  success: true,
  insights: insights || "No insights generated"
});
```

} catch (err) {
console.error("🔥 AI ROUTE ERROR:", err);

```
// ✅ Return REAL error (critical)
return res.status(500).json({
  success: false,
  error: err.message || "AI failed"
});
```

}
});

module.exports = router;
