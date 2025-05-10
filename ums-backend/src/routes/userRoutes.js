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

// User management routes (admin only)
router.get("/", authenticateUser, authorize("admin"), getAllUsers)
router.get("/:id", authenticateUser, authorize("admin"), getUserById)
router.post("/", authenticateUser, authorize("admin"), registerUser)
router.put("/:id", authenticateUser, authorize("admin"), updateUser)
router.delete("/:id", authenticateUser, authorize("admin"), deleteUser)

// Role-based dashboard routes


export default router
