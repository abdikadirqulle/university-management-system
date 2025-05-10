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
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const { login, loginStudent, isLoading, error, clearError } = useAuth();

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginStudent({ studentId, password: studentPassword });
  };

  // Login info for demo
  const demoAccounts = [
    {
      role: "Academic Admin",
      email: "admin@university.edu",
      password: "password",
    },
  ];

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <School className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Scholar Nexus</CardTitle>
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
            <form onSubmit={handleStaffSubmit}>
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
                    placeholder="your.email@university.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) clearError();
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) clearError();
                    }}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login as Staff"}
                </Button>
              </CardContent>
            </form>
          </TabsContent>
          
          <TabsContent value="student">
            <form onSubmit={handleStudentSubmit}>
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
                    value={studentId}
                    onChange={(e) => {
                      setStudentId(e.target.value);
                      if (error) clearError();
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="studentPassword">Password</Label>
                  </div>
                  <Input
                    id="studentPassword"
                    type="password"
                    placeholder="Enter password"
                    value={studentPassword}
                    onChange={(e) => {
                      setStudentPassword(e.target.value);
                      if (error) clearError();
                    }}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login as Student"}
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
