import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  imageUrl: text("image_url"),
  userId: text("user_id").notNull(),
});

// Images table for storing uploaded images
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  userId: text("user_id").notNull(),
  messageId: integer("message_id").references(() => messages.id),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Schema for inserting messages
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

// Schema for inserting images
export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  uploadedAt: true,
});

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
