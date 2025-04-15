import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/auth";

export const useAuthGuard = (
  allowedRoles?: UserRole[],
  redirectTo: string = "/login",
) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip check if still loading
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate(redirectTo);
      return;
    }

    // If roles are specified, check if user role is allowed
    if (allowedRoles && allowedRoles.length > 0 && user) {
      const hasPermission = allowedRoles.includes(user.role);

      if (!hasPermission) {
        // Redirect based on user role
        switch (user.role) {
          case "academic":
            navigate("/admin/dashboard");
            break;
          case "admission":
            navigate("/admission/dashboard");
            break;
          case "student":
            navigate("/student/dashboard");
            break;
          default:
            navigate(redirectTo);
        }
      }
    }
  }, [isAuthenticated, user, allowedRoles, navigate, redirectTo, isLoading]);

  return { isAuthenticated, user, isLoading };
};
