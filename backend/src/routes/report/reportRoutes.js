import express from "express"
import { authenticateUser } from "../../middleware/authMiddleware.js"
import {
  exportEnrollmentTrendsPDF,
  exportEnrollmentTrendsExcel,
  exportFacultyDistributionPDF,
  exportFacultyDistributionExcel,
  exportCourseEnrollmentPDF,
  exportCourseEnrollmentExcel,
  exportEnrollmentByDepartmentPDF,
  exportEnrollmentByDepartmentExcel,
  exportTuitionFeeIncomePDF,
  exportTuitionFeeIncomeExcel,
  getEnrollmentTrendsDataAPI,
  getFacultyDistributionDataAPI,
  getCourseEnrollmentDataAPI,
  getEnrollmentByDepartmentDataAPI,
  getTuitionFeeIncomeDataAPI,
  getPaymentSummaryDataAPI,
  testCoursesAPI,
  debugPaymentSummaryAPI,
} from "../../controllers/report/reportController.js"

const router = express.Router()

// Protect all report routes with authentication
router.use(authenticateUser)

// Data endpoints for reports
router.get("/enrollment-trends", getEnrollmentTrendsDataAPI)
router.get("/faculty-distribution", getFacultyDistributionDataAPI)
router.get("/course-enrollment", getCourseEnrollmentDataAPI)
router.get("/enrollment-by-department", getEnrollmentByDepartmentDataAPI)
router.get("/tuition-fee-income", getTuitionFeeIncomeDataAPI)
router.get("/payment-summary", getPaymentSummaryDataAPI)

// Test endpoints
router.get("/test-courses", testCoursesAPI)
router.get("/debug-payment-summary", debugPaymentSummaryAPI)

// Export endpoints
router.get("/enrollment-trends/pdf", exportEnrollmentTrendsPDF)
router.get("/enrollment-trends/excel", exportEnrollmentTrendsExcel)

router.get("/faculty-distribution/pdf", exportFacultyDistributionPDF)
router.get("/faculty-distribution/excel", exportFacultyDistributionExcel)

router.get("/course-enrollment/pdf", exportCourseEnrollmentPDF)
router.get("/course-enrollment/excel", exportCourseEnrollmentExcel)

// Enrollment by Department Report
router.get("/enrollment-by-department/pdf", exportEnrollmentByDepartmentPDF)
router.get("/enrollment-by-department/excel", exportEnrollmentByDepartmentExcel)

// NEW: Tuition Fee Income Report
router.get("/tuition-fee-income/pdf", exportTuitionFeeIncomePDF)
router.get("/tuition-fee-income/excel", exportTuitionFeeIncomeExcel)

export default router
