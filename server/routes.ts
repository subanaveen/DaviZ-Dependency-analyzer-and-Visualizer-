import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateDependencies } from "./ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to get dependencies for a feature
  app.post("/api/dependencies", async (req, res) => {
    try {
      const { feature, context } = req.body;
      
      if (!feature) {
        return res.status(400).json({ error: "Feature is required" });
      }
      
      const result = await generateDependencies(feature, context);
      
      return res.json(result);
    } catch (error) {
      console.error("Error generating dependencies:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: errorMessage });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
