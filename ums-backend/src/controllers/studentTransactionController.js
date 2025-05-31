import { PrismaClient } from '@prisma/client';
import { generateStudentTransactionPDF } from '../utils/studentTransactionPdf.js';

const prisma = new PrismaClient();

/**
 * Export a single student's transaction history as PDF
 * @param {Object} req - Express request object with studentId parameter
 * @param {Object} res - Express response object
 */
export const exportStudentTransactionPDF = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({ 
        success: false,
        message: 'Student ID is required' 
      });
    }
    
    // Fetch student data
    const student = await prisma.student.findUnique({
      where: { studentId },
      include: {
        department: true,
      }
    });
    
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }
    
    // Fetch all transactions for this student
    const transactions = await prisma.payment.findMany({
      where: { studentId },
      orderBy: { paymentDate: 'desc' }
    });
    
    // Generate PDF
    const doc = generateStudentTransactionPDF(student, transactions);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=student_${studentId}_transactions.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error exporting student transaction PDF:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to export student transaction data', 
      error: error.message 
    });
  }
};
