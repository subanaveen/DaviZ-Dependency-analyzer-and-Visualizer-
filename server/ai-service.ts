import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure Google AI API
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("GOOGLE_API_KEY is not defined in environment variables");
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
      `Identify at least **10-20 primary dependencies** for '${feature}${contextString}', ensuring they are **directly relevant**. `
      + "Format each dependency as:\n"
      + "* **Dependency Name** – (Reason why it is a primary dependency)\n"
      + "\n"
      + "### Important Instructions:\n"
      + "1. **Focus Only on Primary Dependencies** – No secondary ones.\n"
      + `2. **Ensure Relevance** – ${feature} Dependencies must have a **strong logical connection** to the ${contextString}.\n`
      + "3. **Avoid Generic Dependencies** – Must have a clear, well-explained purpose.\n"
      + "4. **Maintain Clarity & Structure** – Use precise technical terms.\n"
      + "\n"
      + "Proceed with generating the list."
    );

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawOutput = response.text();

    if (!rawOutput) {
      console.warn(`⚠️ AI did not return dependencies for ${feature}. Using fallback values.`);
      return {
        dependencies: {
          Primary: Array.from({ length: 5 }, (_, i) => `Placeholder Dependency ${i + 1} (for ${feature}${contextString})`)
        },
        explanations: {}
      };
    }

    const primaryDependencies: string[] = [];
    const explanations: Record<string, string> = {};

    // Parse the AI response to extract dependencies and explanations
    const lines = rawOutput.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      const match = trimmedLine.match(/^\*\s*\**(.+?)\**\s*\((.+?)\)$/);
      
      if (match) {
        const [, dependencyName, reason] = match;
        const fullDependencyName = `${dependencyName} (for ${feature}${contextString})`;
        primaryDependencies.push(fullDependencyName);
        explanations[fullDependencyName] = reason.trim();
      }
    }

    // Add fallbacks if we don't have enough dependencies
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
    console.error("AI Service Error:", error);
    
    // Return fallback values in case of an error
    return {
      dependencies: {
        Primary: [`Error Handling (for ${feature}${fullContext ? ` (for ${fullContext})` : ""})`]
      },
      explanations: {}
    };
  }
}
