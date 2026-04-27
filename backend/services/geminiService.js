const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateInsights(data) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY missing");
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
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

    const result = await Promise.race([
  model.generateContent(prompt),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("AI timeout")), 5000)
  )
]);

    if (!result || !result.response) {
      throw new Error("Invalid Gemini response");
    }

    const text = result.response.text();

    if (!text) {
      throw new Error("Empty AI response");
    }

    return text;

  } catch (err) {
    console.error("🔥 GEMINI ERROR:", err.message);
    throw err; // ❗ IMPORTANT → let route catch it
  }
}

module.exports = { generateInsights };