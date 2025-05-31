export type UserRole = "admin" | "admission" | "financial" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  department?: string;
  studentId?: string;
}

export interface LoginCredentials {
  email: string;
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
