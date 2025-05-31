import ExcelJS from 'exceljs';

/**
 * Generate an Excel workbook with the provided data
 * @param {Object} data - The data to be included in the Excel file
 * @param {string} sheetName - The name of the worksheet
 * @param {Array} columns - The column configuration for the table
 * @returns {ExcelJS.Workbook} - The generated Excel workbook
 */
export const generateExcel = async (data, sheetName, columns) => {
  // Create a new workbook and add a worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  
  // Add columns
  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 20
  }));
  
  // Style the header row
  worksheet.getRow(1).font = {
    bold: true,
    size: 12
  };
  
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  worksheet.getRow(1).border = {
    bottom: { style: 'thin' }
  };
  
  // Add rows
  worksheet.addRows(data);
  
  // Apply zebra striping to rows
  for (let i = 2; i <= data.length + 1; i++) {
    if (i % 2 === 0) {
      worksheet.getRow(i).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF9F9F9' }
      };
    }
  }
  
  // Auto-filter the header row
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length }
  };
  
  // Add footer with generation date
  const footerRow = worksheet.addRow(['Generated on: ' + new Date().toLocaleDateString()]);
  footerRow.font = { italic: true };
  
  return workbook;
};

/**
 * Generate an Excel file for student records
 * @param {Array} students - Array of student objects
 * @returns {ExcelJS.Workbook} - The generated Excel workbook
 */
export const generateStudentsExcel = async (students) => {
  const columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Registration Date', key: 'registrationDate', width: 20 }
  ];
  
  return generateExcel(students, 'Student Records', columns);
};

/**
 * Generate an Excel file for course records
 * @param {Array} courses - Array of course objects
 * @returns {ExcelJS.Workbook} - The generated Excel workbook
 */
export const generateCoursesExcel = async (courses) => {
  const columns = [
    { header: 'Code', key: 'code', width: 15 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Credits', key: 'credits', width: 10 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Instructor', key: 'instructor', width: 25 }
  ];
  
  return generateExcel(courses, 'Course Catalog', columns);
};

/**
 * Generate an Excel file for payment records
 * @param {Array} payments - Array of payment objects
 * @returns {ExcelJS.Workbook} - The generated Excel workbook
 */
export const generatePaymentsExcel = async (payments) => {
  const columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Student', key: 'student', width: 25 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Status', key: 'status', width: 15 }
  ];
  
  return generateExcel(payments, 'Payment Records', columns);
};
