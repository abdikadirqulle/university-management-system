import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AuthState,
  LoginCredentials,
  StudentLoginCredentials,
  User,
} from "../types/auth";
import { api } from "../services/api";
import { authService } from "../services/authService";

// Default role-based redirect paths
const rolePaths = {
  admin: "/admin/dashboard",
  admission: "/admission/dashboard",
  student: "/student/dashboard",
  financial: "/financial/dashboard",
};

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginStudent: (credentials: StudentLoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

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
      api.defaults.headers.common["Authorization"] = `Bearer ${authState.token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [authState.token]);
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (token && storedUser) {
        try {
          // Set initial state from localStorage to prevent flashing unauthenticated state
          const parsedUser = JSON.parse(storedUser);
          setAuthState({
            user: parsedUser,
            token,
            isAuthenticated: true,
            isLoading: true, // Set to true while we verify
            error: null,
          });
          
          // Verify token by getting current user
          const user = await authService.getCurrentUser();
          
          // Update auth state with fresh user data
          setAuthState({
            user, // Use the fresh user data from API
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Auth verification failed:", error);
          
          // Instead of immediately removing token, check if it's a network error
          // Only remove token if it's an authentication error (401/403)
          if (error instanceof Error && error.message.includes("401") || error.message.includes("403")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setAuthState(initialAuthState);
          } else {
            // For other errors (like network issues), keep the user logged in
            // Just use the stored user data
            const parsedUser = JSON.parse(storedUser);
            setAuthState({
              user: parsedUser,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        }
      }
    };
    
    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call the real API using authService
      const { user, token } = await authService.login(credentials);

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
      const redirectPath = rolePaths[user.role] || "/login";
      navigate(redirectPath);

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

  const loginStudent = async (credentials: StudentLoginCredentials): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call the student login API
      const { user, token } = await authService.loginStudent(credentials);

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

      // Navigate to student dashboard
      navigate("/student/dashboard");

      toast.success(`Welcome, ${user.name}!`);
    } catch (error) {
      let errorMessage = "An error occurred during student login";

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

  const logout = async (): Promise<void> => {
    try {
      // Call the authService logout method
      await authService.logout();
      
      // Reset auth state
      setAuthState(initialAuthState);

      // Navigate to login
      navigate("/login");

      toast.success("Logged out successfully");
    } catch (error) {
      let errorMessage = "An error occurred during logout";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Even if the API call fails, we should still clear local state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthState(initialAuthState);
      navigate("/login");
    }
  };

  const clearError = (): void => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, loginStudent, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
