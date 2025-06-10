import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { School } from "lucide-react";

/**
 * A layout component that handles user authentication and redirects the user
 * to their respective dashboard based on their role.
 *
 * The layout consists of two columns. The left column displays a login form
 * with a blurred background image. The right column displays the actual login
 * form. When the user is authenticated, they are redirected to their
 * respective dashboard.
 */

export const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "admission":
          navigate("/admission/dashboard");
          break;
        case "student":
          navigate("/student/dashboard");
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="w-full min-h-screen flex">
      {/* Left side - Login form */}
      <div className="hidden md:flex md:w-1/2 bg-[url('/un-ku.jpeg')] bg-cover bg-center relative flex-col items-center justify-center p-8">
        {/* Overlay with blur effect */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div className="text-center animate-fade-in relative z-10">
          <School className="h-20 w-20 text-white mb-6 mx-auto" />
          <h1 className="text-4xl font-bold text-white mb-4">AqoonMaamul</h1>
          <p className="text-white/80 text-lg max-w-md">
            Welcome to the AqoonMaamul. Access your academic resources, courses, and more.
          </p>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
      
      {/* Right side - Image background */}
     
    </div>
  );
};

export default AuthLayout;
