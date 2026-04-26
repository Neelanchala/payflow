const express = require("express");
const router = express.Router();

const { generateInsights } = require("../services/geminiService");

/* ================= AI INSIGHTS ================= */
router.post("/insights", async (req, res) => {
try {
const data = req.body;

```
if (!data) {
  return res.status(400).json({
    error: "No data provided"
  });
}

const insights = await generateInsights(data);

return res.json({
  success: true,
  insights
});
```

} catch (err) {
console.error("AI ROUTE ERROR:", err);

```
return res.status(500).json({
  success: false,
  error: "AI generation failed"
});
```

}
});

module.exports = router;
