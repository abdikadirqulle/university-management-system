export type UserRole = "academic" | "admission" | "student" | "financial"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
  admissionId?: string
  studentId?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  error: string | null // Added error field
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  clearError: () => void
}
