const { GoogleGenerativeAI } = require("@google/generative-ai");

/* ================= INIT GEMINI ================= */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ================= GENERATE INSIGHTS ================= */
async function generateInsights(data) {
try {
if (!process.env.GEMINI_API_KEY) {
throw new Error("Missing GEMINI_API_KEY");
}

```
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
  const response = await result.response;

  const text = response.text();

  if (!text) {
  throw new Error("Empty response from AI");
  }

  return text;

  } catch (error) {
  console.error("GEMINI SERVICE ERROR:", error.message);

  return "Unable to generate insights at the moment. Please try again.";
  }
  }

module.exports = { generateInsights };
