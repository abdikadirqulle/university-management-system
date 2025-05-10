import express from "express"
import {
  createFaculty,
  getAllFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
} from "../controllers/facultyController.js"
import { authenticateUser, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

// Public routes
router.get("/", getAllFaculties)
router.get("/:id", getFacultyById)

// Admin routes
router.post(
  "/",
  authenticateUser,
  authorize("admin"),
  createFaculty
)

router.put(
  "/:id",
  authenticateUser,
  authorize("admin"),
  updateFaculty
)

router.delete(
  "/:id",
  authenticateUser,
  authorize("admin"),
  deleteFaculty
)

export default router
