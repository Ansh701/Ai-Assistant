import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { insertMessageSchema } from "@shared/schema";
import { createWorker } from "tesseract.js";
import OpenAI from "openai";

// Setup OpenAI with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
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
  app.post("/api/ocr", upload.single("image"), async (req, res) => {
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
      const { content, imageBase64 } = req.body;
      
      if (!content && !imageBase64) {
        return res.status(400).json({ message: "Either content or image is required" });
      }

      // Create messages array for OpenAI API
      const messages = [
        {
          role: "system",
          content: "You are a helpful homework assistant that explains concepts clearly and shows step-by-step solutions. Answer questions in a friendly, tutoring tone using clear explanations. If a question is about math, provide all steps. If something is unclear, ask for clarification."
        }
      ];

      // If there's an image, add it as a message with the content
      if (imageBase64) {
        messages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: content || "Please help me solve this problem."
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        });
      } else {
        // Text-only question
        messages.push({
          role: "user",
          content: content
        });
      }

      // Call OpenAI API
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any,
        temperature: 0.7,
      });

      const answer = response.choices[0].message.content;
      res.json({ answer });
    } catch (error) {
      console.error("Error generating answer:", error);
      res.status(500).json({ message: "Error generating answer" });
    }
  });

  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
