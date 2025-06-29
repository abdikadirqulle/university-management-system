import { api } from "./api";
import { StudentLoginCredentials, User } from "../types/auth";

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

interface ResetResponse {
  success: boolean;
  message: string;
}

export const authService = {
  login: async (credentials: {
    username: string;
    password: string;
  }): Promise<{ user: User; token: string }> => {
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
    const response = await api.post<LoginResponse>(
      "/student-auth/login",
      credentials,
    );
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

  register: async (userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<{ user: User; token: string }> => {
    const response = await api.post<LoginResponse>("/users/register", userData);
    if (!response.data.success) {
      throw new Error(response.data.message || "Registration failed");
    }
    return {
      user: response.data.user,
      token: response.data.token,
    };
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    const response = await api.post<ResetResponse>("/users/forgot-password", {
      email,
    });
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to request password reset",
      );
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    const response = await api.post<ResetResponse>("/users/reset-password", {
      token,
      newPassword,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to reset password");
    }
  },
};
