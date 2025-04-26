import express from "express"
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
} from "../controllers/userController.js"
import { authenticateUser, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

// Public routes
router.post("/register", registerUser)
router.post("/login", loginUser)

// Protected routes
router.get("/me", authenticateUser, getCurrentUser)
router.put("/me", authenticateUser, updateUser)

// Admin routes
router.get("/admin/users", authenticateUser, authorize("admin"), getAllUsers)

router.get(
  "/admin/users/:id",
  authenticateUser,
  authorize("admin"),
  getUserById
)

router.delete(
  "/admin/users/:id",
  authenticateUser,
  authorize("admin"),
  deleteUser
)

// Role-based dashboard routes
router.get(
  "/admin/dashboard",
  authenticateUser,
  authorize("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin dashboard data",
      data: {
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
  "/financial/dashboard",
  authenticateUser,
  authorize("financial"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Financial dashboard data",
      data: {
        payments: [],
        financialStats: {},
      },
    })
  }
)

router.get(
  "/admission/dashboard",
  authenticateUser,
  authorize("admission"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admission dashboard data",
      data: {
        applications: [],
        admissionStats: {},
      },
    })
  }
)

router.get(
  "/student/dashboard",
  authenticateUser,
  authorize("student"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Student dashboard data",
      data: {
        enrollments: [],
        exams: [],
        payments: [],
      },
    })
  }
)

export default router
