import PDFDocument from 'pdfkit';

/**
 * Generate a PDF document with the provided data
 * @param {Object} data - The data to be included in the PDF
 * @param {string} title - The title of the PDF document
 * @param {Array} columns - The column configuration for the table
 * @returns {PDFDocument} - The generated PDF document
 */
export const generatePDF = (data, title, columns) => {
  // Create a new PDF document
  const doc = new PDFDocument({ margin: 50 });
  
  // Add the title
  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown();
  
  // Add the current date
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
  doc.moveDown();

  // Define table dimensions
  const tableTop = 150;
  const tableLeft = 50;
  const rowHeight = 30;
  const colWidth = (doc.page.width - 100) / columns.length;
  
  // Draw table headers
  doc.fontSize(12);
  doc.font('Helvetica-Bold');
  
  // Draw header background
  doc.fillColor('#f0f0f0')
     .rect(tableLeft, tableTop, doc.page.width - 100, rowHeight)
     .fill();
  
  // Draw header text
  doc.fillColor('#000');
  columns.forEach((column, i) => {
    doc.text(
      column.header,
      tableLeft + i * colWidth + 5,
      tableTop + 10,
      { width: colWidth - 10 }
    );
  });
  
  // Draw table rows
  let rowTop = tableTop + rowHeight;
  
  data.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (rowTop > doc.page.height - 50) {
      doc.addPage();
      rowTop = 50;
      
      // Redraw headers on new page
      doc.fillColor('#f0f0f0')
         .rect(tableLeft, rowTop, doc.page.width - 100, rowHeight)
         .fill();
      
      doc.fillColor('#000');
      doc.font('Helvetica-Bold');
      columns.forEach((column, i) => {
        doc.text(
          column.header,
          tableLeft + i * colWidth + 5,
          rowTop + 10,
          { width: colWidth - 10 }
        );
      });
      
      rowTop += rowHeight;
    }
    
    // Draw row background (alternating colors)
    doc.fillColor(rowIndex % 2 === 0 ? '#ffffff' : '#f9f9f9')
       .rect(tableLeft, rowTop, doc.page.width - 100, rowHeight)
       .fill();
    
    // Draw cell borders
    doc.strokeColor('#e0e0e0')
       .lineWidth(0.5)
       .rect(tableLeft, rowTop, doc.page.width - 100, rowHeight)
       .stroke();
    
    // Draw cell content
    doc.fillColor('#000');
    doc.font('Helvetica');
    columns.forEach((column, i) => {
      const value = row[column.key] || '';
      doc.text(
        value.toString(),
        tableLeft + i * colWidth + 5,
        rowTop + 10,
        { width: colWidth - 10 }
      );
    });
    
    rowTop += rowHeight;
  });
  
  // Add footer
  doc.fontSize(10)
     .text('AqoonMaamul', 50, doc.page.height - 50, { align: 'center' });
  
  return doc;
};

/**
 * Generate a PDF for student records
 * @param {Array} students - Array of student objects
 * @returns {PDFDocument} - The generated PDF document
 */
export const generateStudentsPDF = (students) => {
  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Department', key: 'department' },
    { header: 'Registration Date', key: 'registrationDate' }
  ];
  
  return generatePDF(students, 'Student Records', columns);
};

/**
 * Generate a PDF for course records
 * @param {Array} courses - Array of course objects
 * @returns {PDFDocument} - The generated PDF document
 */
export const generateCoursesPDF = (courses) => {
  const columns = [
    { header: 'Code', key: 'code' },
    { header: 'Title', key: 'title' },
    { header: 'Credits', key: 'credits' },
    { header: 'Department', key: 'department' },
    { header: 'Instructor', key: 'instructor' }
  ];
  
  return generatePDF(courses, 'Course Catalog', columns);
};

/**
 * Generate a PDF for payment records
 * @param {Array} payments - Array of payment objects
 * @returns {PDFDocument} - The generated PDF document
 */
export const generatePaymentsPDF = (payments) => {
  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Student', key: 'student' },
    { header: 'Amount', key: 'amount' },
    { header: 'Date', key: 'date' },
    { header: 'Type', key: 'type' },
    { header: 'Status', key: 'status' }
  ];
  
  return generatePDF(payments, 'Payment Records', columns);
};
