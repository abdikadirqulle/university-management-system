import express from "express"
import { getFinancialReport } from "../controllers/financialReportController.js"
import { authorize } from "../middleware/authMiddleware.js"

const router = express.Router()

// Protect all routes
// router.use(protect)
// router.use(authorize(["financial", "admin"]))

// Financial report routes
router.get("/", getFinancialReport)

export default router
