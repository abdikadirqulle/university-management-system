import express from "express"
import { authenticateUser } from "../middleware/authMiddleware.js"
import {
  exportEnrollmentTrendsPDF,
  exportEnrollmentTrendsExcel,
  exportFacultyDistributionPDF,
  exportFacultyDistributionExcel,
  exportCourseEnrollmentPDF,
  exportCourseEnrollmentExcel,
  exportEnrollmentByDepartmentPDF,
  exportEnrollmentByDepartmentExcel,
  getEnrollmentTrendsDataAPI,
  getFacultyDistributionDataAPI,
  getCourseEnrollmentDataAPI,
  getEnrollmentByDepartmentDataAPI,
  testCoursesAPI,
} from "../controllers/reportController.js"

const router = express.Router()

// Protect all report routes with authentication
router.use(authenticateUser)

// Data endpoints for reports
router.get("/enrollment-trends", getEnrollmentTrendsDataAPI)
router.get("/faculty-distribution", getFacultyDistributionDataAPI)
router.get("/course-enrollment", getCourseEnrollmentDataAPI)
router.get("/enrollment-by-department", getEnrollmentByDepartmentDataAPI)

// Test endpoint
router.get("/test-courses", testCoursesAPI)

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

export default router
