import express from "express"
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../../controllers/course/courseController.js"
import { authenticateUser, authorize } from "../../middleware/authMiddleware.js"

const router = express.Router()

// Public routes
router.get("/", getAllCourses)
router.get("/:id", getCourseById)

// Admin routes
router.post("/", authenticateUser, authorize("admin"), createCourse)

router.put("/:id", authenticateUser, authorize("admin"), updateCourse)

router.delete("/:id", authenticateUser, authorize("admin"), deleteCourse)

export default router
