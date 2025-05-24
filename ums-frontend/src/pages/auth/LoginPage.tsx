import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LoaderCircle, School, UserCircle, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const staffSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const studentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type StaffFormData = z.infer<typeof staffSchema>;
type StudentFormData = z.infer<typeof studentSchema>;

const LoginPage = () => {
  const { login, loginStudent, isLoading, error, clearError } = useAuth();

  const staffForm = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      studentId: "",
      password: "",
    },
  });

  const onStaffSubmit = async (data: StaffFormData) => {
    try {
      await login(data);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const onStudentSubmit = async (data: StudentFormData) => {
    try {
      await loginStudent({
        studentId: data.studentId,
        password: data.password
      });
    } catch (error) {
      console.error('Student login failed:', error);
    }
  };


  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <School className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">scholar nexus</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="staff" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" /> Staff Login
            </TabsTrigger>
            <TabsTrigger value="student" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Student Login
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="staff">
            <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-4">
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="text-sm">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...staffForm.register("email")}
                  />
                  {staffForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{staffForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...staffForm.register("password")}
                  />
                  {staffForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{staffForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
                </Button>
              </CardContent>
            </form>
          </TabsContent>
          
          <TabsContent value="student">
            <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="text-sm">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="Enter your student ID"
                    {...studentForm.register("studentId")}
                  />
                  {studentForm.formState.errors.studentId && (
                    <p className="text-sm text-red-500">{studentForm.formState.errors.studentId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...studentForm.register("password")}
                    onChange={() => error && clearError()}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
                </Button>
              </CardContent>
            </form>
            <CardFooter className="text-xs text-center text-muted-foreground pt-0">
          <p className="w-full">For students: Your default password is your Student ID</p>
        </CardFooter>
          </TabsContent>
        </Tabs>
        
     
      </Card>
    </div>
  );
};

export default LoginPage;
