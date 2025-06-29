import express from "express"
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  toggleUserActivation,
  requestPasswordReset,
  resetPassword,
} from "../controllers/userController.js"
import { authenticateUser, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

// Public routes
router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/forgot-password", requestPasswordReset)
router.post("/reset-password", resetPassword)

// Protected routes
router.post("/logout", authenticateUser, logoutUser)
router.get("/me", authenticateUser, getCurrentUser)
router.put("/me", authenticateUser, updateUser)

// User management routes (admin only)
router.get("/", authenticateUser, authorize("admin"), getAllUsers)
router.get("/:id", authenticateUser, authorize("admin"), getUserById)
router.post("/", authenticateUser, authorize("admin"), registerUser)
router.put("/:id", authenticateUser, authorize("admin"), updateUser)
router.delete("/:id", authenticateUser, authorize("admin"), deleteUser)
router.patch(
  "/:id/toggle-activation",
  authenticateUser,
  authorize("admin"),
  toggleUserActivation
)

// Role-based dashboard routes

export default router
