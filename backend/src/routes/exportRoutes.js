import express from 'express';
import { 
  exportStudentsPDF, 
  exportStudentsExcel,
  exportCoursesPDF,
  exportCoursesExcel,
  exportPaymentsPDF,
  exportPaymentsExcel
} from '../controllers/exportController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// PDF export routes
router.get('/students/pdf', authenticateUser, exportStudentsPDF);
router.get('/courses/pdf', authenticateUser, exportCoursesPDF);
router.get('/payments/pdf', authenticateUser, exportPaymentsPDF);

// Excel export routes
router.get('/students/excel', authenticateUser, exportStudentsExcel);
router.get('/courses/excel', authenticateUser, exportCoursesExcel);
router.get('/payments/excel', authenticateUser, exportPaymentsExcel);

export default router;
