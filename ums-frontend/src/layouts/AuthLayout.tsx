import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case "academic":
          navigate("/admin/dashboard")
          break
        case "admission":
          navigate("/admission/dashboard")
          break
        case "student":
          navigate("/student/dashboard")
          break
        default:
          break
      }
    }
  }, [isAuthenticated, user, navigate])

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
