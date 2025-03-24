import { createContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { AuthResponse } from "@shared/types";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  checkAuth: async () => false
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiRequest<AuthResponse>("POST", "/api/auth/login", { username, password });
      
      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        setLocation("/");
        
        toast({
          title: "Welcome back!",
          description: `You've successfully logged in as ${response.user.firstName} ${response.user.lastName}`,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    setLocation("/login");
    
    // Call logout endpoint
    apiRequest("POST", "/api/auth/logout").catch(err => {
      console.error("Logout error:", err);
    });
    
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
    });
  };

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return false;
    }
    
    try {
      setLoading(true);
      const response = await apiRequest<{ user: AuthContextType["user"] }>("GET", "/api/auth/user");
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error("User data not found");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
