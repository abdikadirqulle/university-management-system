export type UserRole = "admin" | "admission" | "financial" | "student";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  password?: string;
  department?: string;
  studentId?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface StudentLoginCredentials {
  studentId: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  error: string | null; // Added error field
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user: User;
  token: string;
}
