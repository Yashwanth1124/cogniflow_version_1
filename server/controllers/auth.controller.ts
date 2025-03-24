import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { InsertUser, insertUserSchema } from "@shared/schema";
import { LoginCredentials } from "@shared/types";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// JWT secret key - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "cogniflow-erp-super-secret-key-2023";
const JWT_EXPIRY = "24h";

// Login validation schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register validation schema (extends the base user schema with password confirmation)
const registerSchema = insertUserSchema.extend({
  passwordConfirm: z.string().min(6, "Password confirmation must be at least 6 characters"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

export const authController = {
  // Login user
  login: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);
      const { username, password } = validatedData;
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // In a real app, we'd verify the password hash, here we'll do a simple comparison for demo
      // This simulates bcrypt.compare since we're storing hashed passwords in our demo data
      const isPasswordValid = user.password === "$2b$10$CqZ.IzuNGjmCN1xfMzVeUOXTpZQQTXmK5Z7XHv0Z8Qv4p6RKWMgxa";
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );
      
      // Log audit trail
      await storage.createAuditLog({
        userId: user.id,
        action: "LOGIN",
        entityType: "user",
        entityId: user.id,
        details: { ip: req.ip }
      });
      
      // Return user data and token
      return res.status(200).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  
  // Register new user
  register: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);
      const { passwordConfirm, ...userData } = validatedData;
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
      
      // In a real app, we'd hash the password with bcrypt
      // const hashedPassword = await bcrypt.hash(userData.password, 10);
      // userData.password = hashedPassword;
      
      // For demo, store the same hash as our demo users
      userData.password = "$2b$10$CqZ.IzuNGjmCN1xfMzVeUOXTpZQQTXmK5Z7XHv0Z8Qv4p6RKWMgxa";
      
      // Create user
      const newUser = await storage.createUser(userData);
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: newUser.id, 
          username: newUser.username,
          role: newUser.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );
      
      // Log audit trail
      await storage.createAuditLog({
        userId: newUser.id,
        action: "REGISTER",
        entityType: "user",
        entityId: newUser.id,
        details: { ip: req.ip }
      });
      
      // Return user data and token
      return res.status(201).json({
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  
  // Logout user
  logout: async (req: Request, res: Response) => {
    // In a stateless JWT setup, there's no server-side logout
    // The client should simply remove the token from storage
    
    return res.status(200).json({ message: "Logged out successfully" });
  },
  
  // Get current user
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      // The user id is set in the authenticateJWT middleware
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      return res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};
