import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import {
  exportEnrollmentTrendsPDF,
  exportEnrollmentTrendsExcel,
  exportFacultyDistributionPDF,
  exportFacultyDistributionExcel,
  exportCourseEnrollmentPDF,
  exportCourseEnrollmentExcel,
  exportEnrollmentByDepartmentPDF,
  exportEnrollmentByDepartmentExcel
} from '../controllers/reportController.js';

const router = express.Router();

// Protect all report routes with authentication
router.use(authenticateUser);

// Enrollment Trends Report
router.get('/enrollment-trends/pdf', exportEnrollmentTrendsPDF);
router.get('/enrollment-trends/excel', exportEnrollmentTrendsExcel);

// Faculty Distribution Report
router.get('/faculty-distribution/pdf', exportFacultyDistributionPDF);
router.get('/faculty-distribution/excel', exportFacultyDistributionExcel);

// Course Enrollment Report
router.get('/course-enrollment/pdf', exportCourseEnrollmentPDF);
router.get('/course-enrollment/excel', exportCourseEnrollmentExcel);

// Enrollment by Department Report
router.get('/enrollment-by-department/pdf', exportEnrollmentByDepartmentPDF);
router.get('/enrollment-by-department/excel', exportEnrollmentByDepartmentExcel);

export default router;
