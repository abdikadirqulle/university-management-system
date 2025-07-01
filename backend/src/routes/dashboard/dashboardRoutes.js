import express from "express"
import {
  getAdminStats,
  getFinancialStats,
  getAdmissionStats,
  getStudentStats,
} from "../../controllers/dashboard/dashboardController.js"
import { authenticateUser, authorize } from "../../middleware/authMiddleware.js"

const router = express.Router()

// Admin dashboard stats
router.get(
  "/admin",
  authenticateUser,
  authorize("admin", "admission"),
  getAdminStats
)

// Financial dashboard stats
router.get(
  "/financial",
  authenticateUser,
  authorize("admin", "financial"),
  getFinancialStats
)

// Admission dashboard stats
router.get(
  "/admission",
  authenticateUser,
  authorize("admin", "admission"),
  getAdmissionStats
)

// Student dashboard stats - student can only access their own stats
router.get(
  "/student/:studentId",
  authenticateUser,
  authorize("admin", "admission", "student"),
  getStudentStats
)

export default router
