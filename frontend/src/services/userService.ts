import { api } from "./api";
import { User } from "../types/auth";

interface UsersResponse {
  success: boolean;
  users: User[];
}

interface UserResponse {
  success: boolean;
  user: User;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<UsersResponse>("/users");
    if (!response.data.success) {
      throw new Error("Failed to fetch users");
    }
    return response.data.users;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<UserResponse>(`/users/${id}`);
    if (!response.data.success) {
      throw new Error("Failed to fetch user");
    }
    return response.data.user;
  },

  // Create a new user
  createUser: async (userData: Omit<User, "id">): Promise<User> => {
    const response = await api.post<UserResponse>("/users", userData);
    if (!response.data.success) {
      throw new Error("Failed to create user");
    }
    return response.data.user;
  },

  // Update an existing user
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<UserResponse>(`/users/${id}`, userData);
    if (!response.data.success) {
      throw new Error("Failed to update user");
    }
    return response.data.user;
  },

  // Delete a user
  deleteUser: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/users/${id}`);
    if (!response.data.success) {
      throw new Error("Failed to delete user");
    }
  },

  // Toggle user activation status
  toggleUserActivation: async (id: string): Promise<User> => {
    const response = await api.patch<UserResponse>(
      `/users/${id}/toggle-activation`,
    );
    if (!response.data.success) {
      throw new Error("Failed to toggle user activation");
    }
    return response.data.user;
  },
};
