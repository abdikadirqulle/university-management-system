import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, School, LockKeyhole, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoginCredentials } from "@/types/auth";

const staffSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type StaffFormData = z.infer<typeof staffSchema>;

const LoginPage = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const staffForm = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onStaffSubmit = async (data: StaffFormData) => {
    try {
      // Create a properly typed LoginCredentials object
      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password
      };
      await login(credentials);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center justify-center mb-2">
          <School className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Sign in</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 text-sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-6">
        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              className="pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-primary focus:border-primary"
              placeholder="Enter your email"
              {...staffForm.register("email")}
              onChange={() => error && clearError()}
            />
          </div>
          {staffForm.formState.errors.email && (
            <p className="text-sm text-red-500">{staffForm.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          {/* <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <button 
              type="button" 
              className="text-sm text-primary hover:text-primary/90 dark:text-university-400 dark:hover:text-university-300"
              onClick={() => 
                {}}
            >
              Forgot password?
            </button>
          </div> */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LockKeyhole className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-primary focus:border-primary"
              placeholder="Enter your password"
              {...staffForm.register("password")}
              onChange={() => error && clearError()}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          </div>
          {staffForm.formState.errors.password && (
            <p className="text-sm text-red-500">{staffForm.formState.errors.password.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you a student? <Link to="/auth/student-login" className="text-primary hover:text-primary/90 font-medium">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
