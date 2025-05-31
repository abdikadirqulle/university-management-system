import express from "express";
import {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  approveApplication,
  rejectApplication,
} from "../controllers/applicationController.js";
import { authenticateUser, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all applications - Admin and Admission access
router.get("/", authenticateUser, authorize("admin", "admission"), getAllApplications);

// Get application by ID - Admin and Admission access
router.get("/:id", authenticateUser, authorize("admin", "admission"), getApplicationById);

// Create new application - Public access
router.post("/", createApplication);

// Update application - Admin and Admission access
router.put("/:id", authenticateUser, authorize("admin", "admission"), updateApplication);

// Delete application - Admin and Admission access
router.delete("/:id", authenticateUser, authorize("admin", "admission"), deleteApplication);

// Approve application - Admin and Admission access
router.put("/:id/approve", authenticateUser, authorize("admin", "admission"), approveApplication);

// Reject application - Admin and Admission access
router.put("/:id/reject", authenticateUser, authorize("admin", "admission"), rejectApplication);

export default router;
