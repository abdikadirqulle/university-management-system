import express from "express"
import {
  loginStudent,
  getCurrentStudent,
} from "../../controllers/students/studentAuthController.js"
import { authenticateUser } from "../../middleware/authMiddleware.js"

const router = express.Router()

// Student login route
router.post("/login", loginStudent)

// Get current student route (protected)
router.get("/me", authenticateUser, getCurrentStudent)

export default router
