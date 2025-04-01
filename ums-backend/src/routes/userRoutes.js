import express from "express"
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../controllers/userController.js"
import { authenticateUser, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

// Public routes
router.post("/register", registerUser)
router.post("/login", loginUser)

// Protected routes
router.get("/me", authenticateUser, getCurrentUser)

// Role-based routes example
router.get(
  "/admin-dashboard",
  authenticateUser,
  authorize("ADMIN", "SUPER_ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin dashboard data",
      data: {
        // Admin dashboard data would go here
        stats: {
          totalStudents: 1250,
          totalFaculty: 85,
          totalCourses: 96,
          activeEnrollments: 3782,
        },
      },
    })
  }
)

router.get(
  "/student-dashboard",
  authenticateUser,
  authorize("STUDENT"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Student dashboard data",
      data: {
        // Student dashboard data would go here
        enrollments: [],
        exams: [],
        payments: [],
      },
    })
  }
)

export default router
