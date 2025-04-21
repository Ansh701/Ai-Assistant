import { 
  messages, 
  images, 
  users, 
  type Message, 
  type Image, 
  type User, 
  type InsertMessage, 
  type InsertImage, 
  type InsertUser 
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUserId(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: number): Promise<void>;
  
  // Image methods
  getImage(id: number): Promise<Image | undefined>;
  createImage(image: InsertImage): Promise<Image>;
  deleteImage(id: number): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private images: Map<number, Image>;
  
  private userId: number;
  private messageId: number;
  private imageId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.images = new Map();
    
    this.userId = 1;
    this.messageId = 1;
    this.imageId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByUserId(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => {
        const dateA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
        const dateB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
        return dateA - dateB;
      });
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: now 
    };
    this.messages.set(id, message);
    return message;
  }
  
  async deleteMessage(id: number): Promise<void> {
    this.messages.delete(id);
  }
  
  // Image methods
  async getImage(id: number): Promise<Image | undefined> {
    return this.images.get(id);
  }
  
  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = this.imageId++;
    const now = new Date();
    const image: Image = { 
      ...insertImage, 
      id, 
      uploadedAt: now 
    };
    this.images.set(id, image);
    return image;
  }
  
  async deleteImage(id: number): Promise<void> {
    this.images.delete(id);
  }
}

export const storage = new MemStorage();
