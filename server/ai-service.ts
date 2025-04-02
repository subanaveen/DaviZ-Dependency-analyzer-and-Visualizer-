import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure Google AI API
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("❌ GOOGLE_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Function to normalize text from AI response
function normalizeText(text: string): string {
  return text.replace(/\*\s{2,}/g, "* "); // Replace extra spaces after asterisks with a single space
}

// Function to get AI-generated dependencies
export async function generateDependencies(
  feature: string, 
  fullContext?: string | null
): Promise<{ 
  dependencies: { Primary: string[] }, 
  explanations: Record<string, string> 
}> {
  try {
    const contextString = fullContext ? ` (for ${fullContext})` : "";

    const prompt = (
      `### Task:\n`
      + `Identify at least **10-20 primary dependencies** for '${feature}${contextString}'.\n\n`
      + `### Response Format:\n`
      + `Return dependencies strictly in this Markdown format:\n\n`
      + `- **Dependency Name**: Explanation in one sentence.\n`
      + `- **Dependency Name**: Explanation in one sentence.\n\n`
      + `### Example Output:\n`
      + `- **Engine Horsepower**: Determines the car's acceleration potential.\n`
      + `- **Weight Distribution**: Affects handling and stability.\n\n`
      + `⚠️ **Important Rules:**\n`
      + `1. Only include **Primary Dependencies**.\n`
      + `2. Dependencies must be **logically relevant** to '${feature}${contextString}'.\n`
      + `3. Format must match the given Markdown structure. Do not add extra text.\n`
      + `\nProceed with generating the list.`
    );

    // Use a better model if available
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    console.log("📢 Prompt sent to Google AI:\n", prompt);

    // Generate dependencies
    let result = await model.generateContent(prompt);
    let response = await result.response;
    let rawOutput = response.text();

    console.log("📜 AI Raw Output:\n", rawOutput);

    // If AI doesn't return anything valid, retry once
    if (!rawOutput || !rawOutput.includes("**")) {
        console.warn(`⚠️ AI did not return valid dependencies for ${feature}. Retrying...`);
        result = await model.generateContent(prompt);
        response = await result.response;
        rawOutput = response.text();
    }

    // If still no valid output, return fallback values
    if (!rawOutput || !rawOutput.includes("**")) {
      console.warn(`⚠️ AI did not return valid dependencies for ${feature}. Using fallback values.`);
      return {
        dependencies: {
          Primary: Array.from({ length: 5 }, (_, i) => `Placeholder Dependency ${i + 1} (for ${feature}${contextString})`)
        },
        explanations: {}
      };
    }

    const primaryDependencies: string[] = [];
    const explanations: Record<string, string> = {};

    // Parse AI response to extract dependencies and explanations
    const lines = rawOutput.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Match both bold and non-bold dependency names
      const match = trimmedLine.match(/^[-*]\s*(?:\*\*(.+?)\*\*|(.+?))\s*[:-]\s*(.+)$/);

      if (match) {
        const [, boldName, normalName, reason] = match;
        const dependencyName = boldName ? boldName.trim() : normalName.trim();
        primaryDependencies.push(dependencyName);
        explanations[dependencyName] = reason.trim();
      }
    }

    // Add fallbacks if not enough dependencies
    if (primaryDependencies.length < 10) {
      const fallbackCount = 10 - primaryDependencies.length;
      const fallbacks = Array.from(
        { length: fallbackCount }, 
        (_, i) => `Feature ${i + 1} (for ${feature}${contextString})`
      );
      primaryDependencies.push(...fallbacks);
    }

    return {
      dependencies: { Primary: primaryDependencies.slice(0, 20) }, // Trim to 20 max
      explanations
    };
  } catch (error) {
    console.error("❌ AI Service Error:", error);
    
    // Return fallback values in case of an error
    return {
      dependencies: {
        Primary: [`Error Handling (for ${feature}${fullContext ? ` (for ${fullContext})` : ""})`]
      },
      explanations: {}
    };
  }
}
