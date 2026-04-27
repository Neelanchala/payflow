const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateInsights(data) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

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

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }]
    });

    const text = result.response.text();

    return text;

  } catch (err) {
    console.error("🔥 GEMINI ERROR:", err);
    throw err;
  }
}

module.exports = { generateInsights };