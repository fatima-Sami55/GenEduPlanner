const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ FATAL: GEMINI_API_KEY is not defined in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Use gemini-2.0-flash as confirmed available via API check (user requested 2.5, likely meant 2.0)
const MODEL_NAME = "gemini-2.5-flash";

const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: {
    responseMimeType: "application/json", // Enforce JSON output
  },
});

/**
 * Generates content with retry logic
 * @param {string} prompt
 * @returns {Promise<any>} Parsed JSON response
 */
const AppError = require("./utils/appError");

// ... (imports remain)

const generateContent = async (prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch (e) {
        console.warn(`JSON Parse failed attempt ${i + 1}:`, text.substring(0, 100) + "...");
        throw new Error("Invalid JSON response from Gemini");
      }
    } catch (error) {
      console.error(`Gemini API Error (Attempt ${i + 1}/${retries}):`, error.message);

      // Handle Quota Exceeded specifically
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        // Stop retrying immediately if quota exceeded? 
        // Logic in logs showed it retried anyway. 
        // If we know it's quota, we should probably fail faster or just throw the correct error at the end.
        // Since the user wants to see the message, we must ensure it propagates.
        // We will let it retry (in case it's a momentary spike) but if it fails all, we throw 429.
      }

      if (i === retries - 1) {
        // Check for 429 in the final error
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          throw new AppError("Gemini Quota Exceeded. Please try again later.", 429);
        }
        throw new AppError(error.message, 500);
      }

      await new Promise((res) => setTimeout(res, 1000 * (i + 1))); // Exponential backoff-ish
    }
  }
};

module.exports = { generateContent };
