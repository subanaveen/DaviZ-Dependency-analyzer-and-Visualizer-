import { useState } from "react";
import { Dependencies } from "./types";

interface GeminiAIHookResult {
  isLoading: boolean;
  error: string | null;
  getDependencies: (feature: string, context?: string) => Promise<{
    dependencies: Record<string, string[]>;
    explanations: Record<string, string>;
  }>;
}

export function useGeminiAI(): GeminiAIHookResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDependencies = async (feature: string, context?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/dependencies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feature, context }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    getDependencies,
  };
}
