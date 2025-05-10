import axios from "axios";
import { toast } from "sonner";
import config from "@/config/enviroment-config";

// Create axios instance with environment-specific base URL
export const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Log which environment we're using (for debugging)
console.log(`API is using ${config.isProduction ? 'production' : 'development'} environment: ${config.apiUrl}`);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    // Handle different error statuses
    if (response) {
      // Unauthorized - token expired or invalid
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Reload the page to reset state and redirect to login
        window.location.href = "/login";

        toast.error("Your session has expired. Please login again.");
      }

      // Forbidden - insufficient permissions
      if (response.status === 403) {
        toast.error("You do not have permission to perform this action.");
      }

      // Other errors
      if (
        response.status === 404 ||
        response.status === 400 ||
        response.status === 500
      ) {
        const errorMessage =
          response.data?.message || "An error occurred. Please try again.";
        toast.error(errorMessage);
      }
    } else {
      // Network error or server is down
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  },
);
