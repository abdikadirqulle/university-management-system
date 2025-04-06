import { create } from "zustand"
import { User } from "@/types/auth"

interface UserState {
  users: User[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchUsers: () => Promise<void>
  addUser: (user: User) => Promise<void>
  updateUser: (id: string, userData: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null })
    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Sample data
      const sampleUsers: User[] = [
        {
          id: "1",
          email: "admin@university.edu",
          name: "Admin User",
          password: "password",
          role: "academic",
        },
        {
          id: "2",
          email: "admission@university.edu",
          name: "Admission Officer",
          password: "password",
          role: "admission",
        },
        {
          id: "3",
          email: "financial@university.edu",
          name: "Finance Officer",
          password: "password",
          role: "financial",
        },
      ]

      set({ users: sampleUsers, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch users",
        isLoading: false,
      })
    }
  },

  addUser: async (user: User) => {
    set({ isLoading: true, error: null })
    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000))

      set((state) => ({
        users: [...state.users, { ...user, id: String(Date.now()) }],
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add user",
        isLoading: false,
      })
    }
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    set({ isLoading: true, error: null })
    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000))

      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...userData } : user
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update user",
        isLoading: false,
      })
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000))

      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete user",
        isLoading: false,
      })
    }
  },
}))
