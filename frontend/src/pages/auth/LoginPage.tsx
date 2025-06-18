import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  School,
  LockKeyhole,
  User,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoginCredentials } from "@/types/auth";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

const staffSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

type StaffFormData = z.infer<typeof staffSchema>;

const LoginPage = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Define form
  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Form submission handler
  const onSubmit = async (data: StaffFormData) => {
    try {
      const credentials: LoginCredentials = {
        username: data.username,
        password: data.password,
      };
      await login(credentials);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center justify-center mb-2">
          <School className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Sign in
        </h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 text-sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      className="pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (error) clearError();
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LockKeyhole className="h-5 w-5 text-gray-400" />
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      className="pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (error) clearError();
                      }}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye /> : <EyeOff />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

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
      </Form>
    </div>
  );
};

export default LoginPage;
