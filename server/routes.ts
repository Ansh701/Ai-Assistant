import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { insertMessageSchema } from "@shared/schema";
import { createWorker } from "tesseract.js";
import { generateHomeworkAnswer } from "./lib/gemini";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG images are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/messages", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      
      const messages = await storage.getMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating message" });
    }
  });

  // Endpoint for OCR processing
  app.post("/api/ocr", upload.single("image"), async (req: Request & { file?: any }, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Convert buffer to base64
      const base64Image = file.buffer.toString("base64");
      const dataURI = `data:${file.mimetype};base64,${base64Image}`;

      // Process with Tesseract.js
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(dataURI);
      await worker.terminate();

      res.json({ text: data.text });
    } catch (error) {
      console.error("Error processing OCR:", error);
      res.status(500).json({ message: "Error processing image" });
    }
  });

  // Endpoint for generating AI responses
  app.post("/api/generate-answer", async (req, res) => {
    try {
      console.log("Received request to /api/generate-answer");
      console.log("Request body:", req.body);
      
      const { content, imageBase64 } = req.body;
      
      if (!content && !imageBase64) {
        console.log("No content or image provided");
        return res.status(400).json({ message: "Either content or image is required" });
      }

      // Prepare a helpful homework assistant prompt
      let prompt = content || "Please help me solve this problem.";
      
      // Add instructions for the AI to follow
      const enhancedPrompt = "You are a helpful homework assistant. " + 
        "Please explain this concept clearly with step-by-step solutions. " +
        "Use a friendly, tutoring tone. For math problems, show all steps. " +
        "Here's the question: " + prompt;
      
      console.log("Calling Gemini API...");
      
      try {
        // Call Gemini API
        const answer = await generateHomeworkAnswer(enhancedPrompt, imageBase64);
        
        console.log("Received response from Gemini");
        console.log("Answer:", answer?.substring(0, 50) + "...");
        
        res.json({ answer });
      } catch (error) {
        console.error("Error from Gemini API:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error generating answer:", error);
      res.status(500).json({ message: "Error generating answer" });
    }
  });

  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}