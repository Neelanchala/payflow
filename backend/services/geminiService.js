const { GoogleGenerativeAI } = require("@google/generative-ai");

/* ================= INIT GEMINI ================= */
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
console.warn("⚠️ GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

/* ================= GENERATE INSIGHTS ================= */
async function generateInsights(data) {
try {
if (!apiKey) {
throw new Error("Missing GEMINI_API_KEY");
}

```
if (!data) {
  throw new Error("No data provided to AI");
}

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});

const prompt = `
```

You are a business assistant for a small shop owner.

Analyze the following business data:
${JSON.stringify(data)}

Provide:

1. Top selling products
2. Low performing products
3. Key business insights
4. Suggestions to improve sales
5. Inventory restock advice

Keep the response:

* Short
* Practical
* Easy to understand
  `;

  const result = await model.generateContent(prompt);

  if (!result || !result.response) {
  throw new Error("Invalid response from Gemini");
  }

  const text = result.response.text();

  if (!text || text.trim().length === 0) {
  throw new Error("Empty AI response");
  }

  return text;

  } catch (error) {
  console.error("🔥 GEMINI SERVICE ERROR:", error.message);

  // ❗ IMPORTANT: let route handle it properly
  throw error;
  }
  }

module.exports = { generateInsights };
