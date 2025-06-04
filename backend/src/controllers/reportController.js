import { PrismaClient } from '@prisma/client';
import { 
  generateEnrollmentTrendsPDF, 
  generateFacultyDistributionPDF,
  generateCourseEnrollmentPDF,
  generateEnrollmentByDepartmentPDF
} from '../utils/pdfGenerator.js';
import { 
  generateEnrollmentTrendsExcel, 
  generateFacultyDistributionExcel,
  generateCourseEnrollmentExcel,
  generateEnrollmentByDepartmentExcel
} from '../utils/excelGenerator.js';

const prisma = new PrismaClient();

// Sample data for development - replace with actual database queries in production
const getEnrollmentTrendsData = async (academicYear, semester) => {
  // In a real implementation, this would fetch data from the database
  const data = await prisma.student.count({
    where: {
      academicYear,
      semester
    }
  });
  return data;
};

const getFacultyDistributionData = async (academicYear, semester) => {
  // In a real implementation, this would fetch data from the database
  const data = await prisma.faculty.count({
    where: {
      academicYear,
      semester
    }
  });
  return data;
};

  const getCourseEnrollmentData = async (academicYear, semester) => {
  // In a real implementation, this would fetch data from the database
  const data = await prisma.course.findMany({
    where: {
      academicYear,
      semester
    }
  });
  console.log("course export pdf", data.map((item) => item.title))
  return data;
};

const getEnrollmentByDepartmentData = async (academicYear, semester) => {
  // In a real implementation, this would fetch data from the database
  const data = await prisma.department.count({
    where: {
      academicYear,
      semester
    }
  });
  return data;
};


/**
 * Export enrollment trends report as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportEnrollmentTrendsPDF = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;
    
    if (!academicYear || !semester) {
      return res.status(400).json({ message: 'Academic year and semester are required' });
    }
    
    // Get data for the report
    const data = await getEnrollmentTrendsData(academicYear, semester);
    
    // Generate PDF
    const doc = generateEnrollmentTrendsPDF(data, { academicYear, semester });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=enrollment-trends-${academicYear}-${semester}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error exporting enrollment trends PDF:', error);
    res.status(500).json({ message: 'Failed to export enrollment trends data', error: error.message });
  }
};

/**
 * Export enrollment trends report as Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportEnrollmentTrendsExcel = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;
    
    if (!academicYear || !semester) {
      return res.status(400).json({ message: 'Academic year and semester are required' });
    }
    
    // Get data for the report
    const data = await getEnrollmentTrendsData(academicYear, semester);
    
    // Generate Excel workbook
    const workbook = await generateEnrollmentTrendsExcel(data, { academicYear, semester });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=enrollment-trends-${academicYear}-${semester}.xlsx`);
    
    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting enrollment trends Excel:', error);
    res.status(500).json({ message: 'Failed to export enrollment trends data', error: error.message });
  }
};

/**
 * Export faculty distribution report as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportFacultyDistributionPDF = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;
    
    if (!academicYear || !semester) {
      return res.status(400).json({ message: 'Academic year and semester are required' });
    }
    
    // Get data for the report
    const data = await getFacultyDistributionData(academicYear, semester);
    
    // Generate PDF
    const doc = generateFacultyDistributionPDF(data, { academicYear, semester });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=faculty-distribution-${academicYear}-${semester}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error exporting faculty distribution PDF:', error);
    res.status(500).json({ message: 'Failed to export faculty distribution data', error: error.message });
  }
};

/**
 * Export faculty distribution report as Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportFacultyDistributionExcel = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;
    
    if (!academicYear || !semester) {
      return res.status(400).json({ message: 'Academic year and semester are required' });
    }
    
    // Get data for the report
    const data = await getFacultyDistributionData(academicYear, semester);
    
    // Generate Excel workbook
    const workbook = await generateFacultyDistributionExcel(data, { academicYear, semester });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=faculty-distribution-${academicYear}-${semester}.xlsx`);
    
    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting faculty distribution Excel:', error);
    res.status(500).json({ message: 'Failed to export faculty distribution data', error: error.message });
  }
};

/**
 * Export course enrollment report as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportCourseEnrollmentPDF = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;
    
    if (!academicYear || !semester) {
      return res.status(400).json({ message: 'Academic year and semester are required' });
    }
    
    // Get data for the report
    const data = await getCourseEnrollmentData(academicYear, semester);
    
    // Generate PDF
    const doc = generateCourseEnrollmentPDF(data, { academicYear, semester });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=course-enrollment-${academicYear}-${semester}.pdf`);
    res.setHeader('Cache-Control', 'public, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    doc.pipe(res);
    doc.end();
    
  } catch (error) {
    console.error('Error exporting course enrollment PDF:', error);
    res.status(500).json({ message: 'Failed to export course enrollment data', error: error.message });
  }
};

/**
 * Export course enrollment report as Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportCourseEnrollmentExcel = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;
    
    if (!academicYear || !semester) {
      return res.status(400).json({ message: 'Academic year and semester are required' });
    }
    
    // Get data for the report
    const data = await getCourseEnrollmentData(academicYear, semester);
    
    // Generate Excel workbook
    const workbook = await generateCourseEnrollmentExcel(data, { academicYear, semester });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=course-enrollment-${academicYear}-${semester}.xlsx`);
    
    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting course enrollment Excel:', error);
    res.status(500).json({ message: 'Failed to export course enrollment data', error: error.message });
  }
};

/**
 * Export enrollment by department report as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportEnrollmentByDepartmentPDF = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;
    
    if (!academicYear || !semester) {
      return res.status(400).json({ message: 'Academic year and semester are required' });
    }
    
    // Get data for the report
    const data = await getEnrollmentByDepartmentData(academicYear, semester);
    
    // Generate PDF
    const doc = generateEnrollmentByDepartmentPDF(data, { academicYear, semester });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=enrollment-by-department-${academicYear}-${semester}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error exporting enrollment by department PDF:', error);
    res.status(500).json({ message: 'Failed to export enrollment by department data', error: error.message });
  }
};

/**
 * Export enrollment by department report as Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportEnrollmentByDepartmentExcel = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;
    
    if (!academicYear || !semester) {
      return res.status(400).json({ message: 'Academic year and semester are required' });
    }
    
    // Get data for the report
    const data = await getEnrollmentByDepartmentData(academicYear, semester);
    
    // Generate Excel workbook
    const workbook = await generateEnrollmentByDepartmentExcel(data, { academicYear, semester });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=enrollment-by-department-${academicYear}-${semester}.xlsx`);
    
    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting enrollment by department Excel:', error);
    res.status(500).json({ message: 'Failed to export enrollment by department data', error: error.message });
  }
};
