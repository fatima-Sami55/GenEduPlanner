const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not defined in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Note: older SDK versions might not have listModels. If this fails, we try a direct fetch.
        // But let's assume the SDK is recent enough or we try to list from the genAI instance.
        // Actually, listModels is not on genAI instance directly in some versions, it's usually on a model manager or similar.
        // Let's check typical usage: genAI.getGenerativeModel is the main entry.
        // The listModels method is often available via the API directly or `genAI` object depending on version.
        // Let's try to fetch a known model and print info, or just iterate through known candidates.

        // For now, let's try to assume we can just test a few standard model names.
        const candidates = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        console.log("Testing model availability...");

        for (const modelName of candidates) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                console.log(`✅ ${modelName} is AVAILABLE.`);
                // if available, we stop and recommend? No, let's list all working ones.
            } catch (error) {
                console.log(`❌ ${modelName} is NOT available: ${error.message.split('\n')[0]}`);
            }
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
