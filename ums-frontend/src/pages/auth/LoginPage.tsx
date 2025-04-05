import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoaderCircle, School } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Alert, AlertDescription } from "@/components/ui/alert"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading, error, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login({ email, password })
  }

  // Login info for demo
  const demoAccounts = [
    {
      role: "Academic Admin",
      email: "admin@university.edu",
      password: "password",
    },
  ]

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
        <form onSubmit={handleSubmit}>
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
                  setEmail(e.target.value)
                  if (error) clearError()
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) clearError()
                }}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <LoaderCircle /> : "Login"}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">Demo Accounts (for testing)</p>
            <div className="space-y-2">
              {demoAccounts.map((account, index) => (
                <div key={index} className="rounded border p-2 text-xs">
                  <p className="font-semibold">{account.role}</p>
                  <p>Email: {account.email}</p>
                  <p>Password: {account.password}</p>
                </div>
              ))}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default LoginPage
