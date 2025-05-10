import { api } from "./api";
import { LoginCredentials, StudentLoginCredentials, User } from "../types/auth";

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

interface UserResponse {
  success: boolean;
  user: User;
}

export const authService = {
  login: async (
    credentials: LoginCredentials,
  ): Promise<{ user: User; token: string }> => {
    const response = await api.post<LoginResponse>("/users/login", credentials);
    if (!response.data.success) {
      throw new Error(response.data.message || "Login failed");
    }
    return {
      user: response.data.user,
      token: response.data.token,
    };
  },
  
  loginStudent: async (
    credentials: StudentLoginCredentials,
  ): Promise<{ user: User; token: string }> => {
    const response = await api.post<LoginResponse>("/student-auth/login", credentials);
    if (!response.data.success) {
      throw new Error(response.data.message || "Student login failed");
    }
    return {
      user: response.data.user,
      token: response.data.token,
    };
  },

  logout: async (): Promise<void> => {
    try {
      // Call the backend logout endpoint
      await api.post<{ success: boolean; message: string }>("/users/logout");
    } finally {
      // Always clear local storage, even if the API call fails
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<UserResponse>("/users/me");
    if (!response.data.success) {
      throw new Error("Failed to get current user");
    }
    return response.data.user;
  },

  register: async (userData: any): Promise<{ user: User; token: string }> => {
    const response = await api.post<LoginResponse>("/users/register", userData);
    if (!response.data.success) {
      throw new Error(response.data.message || "Registration failed");
    }
    return {
      user: response.data.user,
      token: response.data.token,
    };
  },
};
