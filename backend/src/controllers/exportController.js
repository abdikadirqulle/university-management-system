import { PrismaClient } from '@prisma/client';
import { generateStudentsPDF, generateCoursesPDF, generatePaymentsPDF } from '../utils/pdfGenerator.js';
import { generateStudentsExcel, generateCoursesExcel, generatePaymentsExcel } from '../utils/excelGenerator.js';

const prisma = new PrismaClient();

/**
 * Export students data as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportStudentsPDF = async (req, res) => {
  try {
    // Fetch students data from database
    const students = await prisma.student.findMany({
      include: {
        department: true,
      }
    });

    // Format data for PDF
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.fullName,
      email: student.email,
      department: student.department?.name || 'N/A',
      registrationDate: new Date(student.createdAt).toLocaleDateString()
    }));

    // Generate PDF
    const doc = generateStudentsPDF(formattedStudents);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=students.pdf');

    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error exporting students PDF:', error);
    res.status(500).json({ message: 'Failed to export students data', error: error.message });
  }
};

/**
 * Export students data as Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportStudentsExcel = async (req, res) => {
  try {
    // Fetch students data from database
    const students = await prisma.student.findMany({
      include: {
        department: true,
      }
    });

    // Format data for Excel
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.fullName,
      email: student.email,
      department: student.department?.name || 'N/A',
      registrationDate: new Date(student.createdAt).toLocaleDateString()
    }));

    // Generate Excel workbook
    const workbook = await generateStudentsExcel(formattedStudents);

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting students Excel:', error);
    res.status(500).json({ message: 'Failed to export students data', error: error.message });
  }
};

/**
 * Export courses data as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportCoursesPDF = async (req, res) => {
  try {
    // Fetch courses data from database
    const courses = await prisma.course.findMany({
      include: {
        department: true,
      }
    });

    // Format data for PDF
    const formattedCourses = courses.map(course => ({
      code: course.code,
      title: course.title,
      credits: course.credits.toString(),
      department: course.department?.name || 'N/A',
    }));

    // Generate PDF
    const doc = generateCoursesPDF(formattedCourses);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=courses.pdf');

    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error exporting courses PDF:', error);
    res.status(500).json({ message: 'Failed to export courses data', error: error.message });
  }
};

/**
 * Export courses data as Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportCoursesExcel = async (req, res) => {
  try {
    // Fetch courses data from database
    const courses = await prisma.course.findMany({
      include: {
        department: true,
      }
    });

    // Format data for Excel
    const formattedCourses = courses.map(course => ({
      code: course.code,
      title: course.title,
      credits: course.credits,
      department: course.department?.name || 'N/A',
    }));

    // Generate Excel workbook
    const workbook = await generateCoursesExcel(formattedCourses);

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=courses.xlsx');

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting courses Excel:', error);
    res.status(500).json({ message: 'Failed to export courses data', error: error.message });
  }
};

/**
 * Export payments data as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportPaymentsPDF = async (req, res) => {
  try {
    // Fetch payments data from database
    const payments = await prisma.payment.findMany({
      include: {
        student: true
      }
    });

    // Format data for PDF
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      student: payment.student?.fullName || 'Unknown',
      amount: `$${payment.amount.toFixed(2)}`,
      date: new Date(payment.paymentDate).toLocaleDateString(),
      type: payment.paymentType,
      status: payment.status
    }));

    // Generate PDF
    const doc = generatePaymentsPDF(formattedPayments);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=payments.pdf');

    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error exporting payments PDF:', error);
    res.status(500).json({ message: 'Failed to export payments data', error: error.message });
  }
};

/**
 * Export payments data as Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportPaymentsExcel = async (req, res) => {
  try {
    // Fetch payments data from database
    const payments = await prisma.payment.findMany({
      include: {
        student: true,
      }
    });

    // Format data for Excel
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      student: payment.student?.fullName || 'Unknown',
      amount: payment.amount,
      date: new Date(payment.paymentDate).toLocaleDateString(),
      type: payment.paymentType,
      status: payment.status
    }));

    // Generate Excel workbook
    const workbook = await generatePaymentsExcel(formattedPayments);

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=payments.xlsx');

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting payments Excel:', error);
    res.status(500).json({ message: 'Failed to export payments data', error: error.message });
  }
};
