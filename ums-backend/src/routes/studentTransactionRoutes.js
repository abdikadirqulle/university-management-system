import express from 'express';
import { exportStudentTransactionPDF } from '../controllers/studentTransactionController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for exporting a single student's transaction history as PDF
router.get('/:studentId/pdf', authenticateUser, exportStudentTransactionPDF);

export default router;
