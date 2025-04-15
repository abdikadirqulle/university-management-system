import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AuthContextType,
  AuthState,
  LoginCredentials,
  User,
} from "../types/auth";
import { api } from "../services/api";

// This would normally come from a real API
const mockUsers = {
  academic: {
    id: "1",
    email: "admin@university.edu",
    name: "Admin User",
    role: "academic",
  },
  admission: {
    id: "2",
    email: "admission@university.edu",
    name: "Admission User",
    role: "admission",
    admissionId: "admission001",
  },
  student: {
    id: "3",
    email: "student@university.edu",
    name: "Student User",
    role: "student",
    studentId: "STU001",
  },
  financial: {
    id: "3",
    email: "financial@university.edu",
    name: "financial User",
    role: "financial",
    studentId: "FN001",
  },
} as const;

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check if token and user exist in local storage
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      return {
        user: JSON.parse(user),
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    }

    return initialAuthState;
  });

  const navigate = useNavigate();

  // When auth state changes, set API auth header
  useEffect(() => {
    if (authState?.token) {
      api.defaults.headers.common["Authorization"] =
        `Bearer ${authState.token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [authState.token]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // For the demo, we'll use mock data instead of a real API call
      // In a real app, this would be:
      // const response = await api.post('/auth/login', credentials);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock authentication logic - in a real app this would come from your API
      let user: User | null = null;
      let token = null;

      if (
        credentials.email === "admin@university.edu" &&
        credentials.password === "password"
      ) {
        user = mockUsers.academic as User;
        token = "mock-token-academic";
      } else if (
        credentials.email === "admission@university.edu" &&
        credentials.password === "password"
      ) {
        user = mockUsers.admission as User;
        token = "mock-token-admission";
      } else if (
        credentials.email === "student@university.edu" &&
        credentials.password === "password"
      ) {
        user = mockUsers.student as User;
        token = "mock-token-student";
      } else if (
        credentials.email === "financial@university.edu" &&
        credentials.password === "password"
      ) {
        user = mockUsers.financial as User;
        token = "mock-token-financial";
      } else {
        throw new Error("Invalid credentials");
      }

      // Save to local storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Navigate based on role
      if (user.role === "academic") {
        navigate("/admin/dashboard");
      } else if (user.role === "admission") {
        navigate("/admission/dashboard");
      } else if (user.role === "student") {
        navigate("/student/dashboard");
      } else if (user.role === "financial") {
        navigate("/financial/dashboard");
      }

      toast.success(`Welcome back, ${user.name}!`);
    } catch (error) {
      let errorMessage = "An error occurred during login";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error(errorMessage);
    }
  };

  const logout = (): void => {
    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Reset auth state
    setAuthState(initialAuthState);

    // Navigate to login
    navigate("/login");

    toast.success("Logged out successfully");
  };

  const clearError = (): void => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
