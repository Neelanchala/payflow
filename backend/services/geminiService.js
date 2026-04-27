const fetch = require("node-fetch");

async function generateInsights(data) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const prompt = `
You are a business assistant.

Analyze this data:
${JSON.stringify(data)}

Give:
1. Top products
2. Weak products
3. Insights
4. Suggestions
5. Restock advice

Keep it short and practical.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const dataRes = await response.json();

    if (!response.ok) {
      console.error("GEMINI RAW ERROR:", dataRes);
      throw new Error(dataRes.error?.message || "Gemini failed");
    }

    return dataRes.candidates[0].content.parts[0].text;

  } catch (err) {
    console.error("🔥 GEMINI ERROR:", err.message);
    throw err;
  }
}

module.exports = { generateInsights };