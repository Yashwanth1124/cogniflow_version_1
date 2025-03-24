import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

// JWT secret key - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "cogniflow-erp-super-secret-key-2023";

interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

// Middleware to authenticate JWT token
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  // Get the auth header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }
  
  // Extract the token from the header (format: "Bearer TOKEN")
  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Invalid token format" });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Add user data to request object
    (req as any).user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Middleware to authorize by role
export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // The user should already be authenticated at this point
    const userRole = (req as any).user?.role;
    
    if (!userRole) {
      return res.status(401).json({ error: "No authenticated user" });
    }
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    next();
  };
};
