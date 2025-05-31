import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, School, LockKeyhole, IdCard, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StudentLoginCredentials } from "@/types/auth";

const studentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type StudentFormData = z.infer<typeof studentSchema>;

const StudentLoginPage = () => {
  const { loginStudent, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      studentId: "",
      password: "",
    },
  });

  const onStudentSubmit = async (data: StudentFormData) => {
    try {
      // Create a properly typed StudentLoginCredentials object
      const credentials: StudentLoginCredentials = {
        studentId: data.studentId,
        password: data.password
      };
      await loginStudent(credentials);
    } catch (error) {
      console.error('Student login failed:', error);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center justify-center mb-2">
          <School className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Student Sign in</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 text-sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-6">
        <div className="space-y-1">
          <Label htmlFor="studentId" className="text-sm font-medium">Student ID</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <IdCard className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="studentId"
              type="text"
              className="pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-primary focus:border-primary"
              placeholder="Enter your student ID"
              {...studentForm.register("studentId")}
              onChange={() => error && clearError()}
            />
          </div>
          {studentForm.formState.errors.studentId && (
            <p className="text-sm text-red-500">{studentForm.formState.errors.studentId.message}</p>
          )}
        </div>

        <div className="space-y-1">
          {/* <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <button 
              type="button" 
              className="text-sm text-primary hover:text-primary/90 dark:text-university-400 dark:hover:text-university-300"
              onClick={() => {}}
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
              {...studentForm.register("password")}
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
          {studentForm.formState.errors.password && (
            <p className="text-sm text-red-500">{studentForm.formState.errors.password.message}</p>
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

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your default password is your Student ID
        </p>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Not a student? <Link to="/login" className="text-primary hover:text-primary/90 font-medium">Staff login</Link>
        </p>
      </div>
    </div>
  );
};

export default StudentLoginPage;
