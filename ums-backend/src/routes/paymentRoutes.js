import express from "express"
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByStudentId,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentStatistics,
} from "../controllers/paymentController.js"
import { authenticateUser, authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

// Protected routes - Financial admin only
router.get(
  "/",
  // authenticateUser,
  // authorize(["admin", "financial"]),
  getAllPayments
)
router.get(
  "/statistics",
  // authenticateUser,
  // authorize(["admin", "financial"]),
  getPaymentStatistics
)
router.get(
  "/:id",
  authenticateUser,
  authorize(["admin", "financial"]),
  getPaymentById
)
router.get(
  "/student/:studentId",
  authenticateUser,
  authorize(["admin", "financial", "student"]),
  getPaymentsByStudentId
)
router.post(
  "/",
  // authenticateUser,
  // authorize(["admin", "financial"]),
  createPayment
)
router.put(
  "/:id",
  // authenticateUser,
  // authorize(["admin", "financial"]),
  updatePayment
)
router.delete(
  "/:id",
  authenticateUser,
  authorize(["admin", "financial"]),
  deletePayment
)

export default router
