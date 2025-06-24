import { create } from "zustand";
import { User } from "@/types/auth";
import { userService } from "@/services/userService";

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: () => Promise<void>;
  addUser: (user: User) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserActivation: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      // Call the API to get all users
      const users = await userService.getAllUsers();
      set({ users, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch users",
        isLoading: false,
      });
    }
  },

  addUser: async (user: User) => {
    set({ isLoading: true, error: null });
    try {
      // Remove password from user object if it exists to avoid sending it in plaintext
      const { password, ...userData } = user;

      // If password exists, include it in a secure way
      const userToCreate = password ? { ...userData, password } : userData;

      // Call the API to create a new user
      const newUser = await userService.createUser(
        userToCreate as Omit<User, "id">,
      );

      set((state) => ({
        users: [...state.users, newUser],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add user",
        isLoading: false,
      });
    }
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      // Call the API to update the user
      const updatedUser = await userService.updateUser(id, userData);

      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...updatedUser } : user,
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update user",
        isLoading: false,
      });
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Call the API to delete the user
      await userService.deleteUser(id);

      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete user",
        isLoading: false,
      });
    }
  },

  toggleUserActivation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Call the API to toggle user activation
      const updatedUser = await userService.toggleUserActivation(id);

      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, isActive: updatedUser.isActive } : user,
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle user activation",
        isLoading: false,
      });
    }
  },
}));
