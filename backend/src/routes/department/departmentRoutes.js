import express from "express"
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../../controllers/department/departmentController.js"
import { authenticateUser, authorize } from "../../middleware/authMiddleware.js"

const router = express.Router()

// Public routes
router.get("/", getAllDepartments)
router.get("/:id", getDepartmentById)

// Admin routes
router.post("/", authenticateUser, authorize("admin"), createDepartment)

router.put("/:id", authenticateUser, authorize("admin"), updateDepartment)

router.delete("/:id", authenticateUser, authorize("admin"), deleteDepartment)

export default router
