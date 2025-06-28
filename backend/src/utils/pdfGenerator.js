import PDFDocument from "pdfkit"

/**
 * Generate a PDF document with the provided data
 * @param {Object} data - The data to be included in the PDF
 * @param {string} title - The title of the PDF document
 * @param {Array} columns - The column configuration for the table
 * @returns {PDFDocument} - The generated PDF document
 */
export const generatePDF = (data, title, columns) => {
  // Create a new PDF document
  const doc = new PDFDocument({ margin: 50 })

  // Add the title
  doc.fontSize(20).text(title, { align: "center" })
  doc.moveDown()

  // Add the current date
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, {
    align: "right",
  })
  doc.moveDown()

  // Define table dimensions
  const tableTop = 150
  const tableLeft = 50
  const rowHeight = 50
  const colWidth = (doc.page.width - 100) / columns.length

  // Draw table headers
  doc.fontSize(12)
  doc.font("Helvetica-Bold")

  // Draw header background
  doc
    .fillColor("#f0f0f0")
    .rect(tableLeft, tableTop, doc.page.width - 100, rowHeight)
    .fill()

  // Draw header text
  doc.fillColor("#000")
  columns.forEach((column, i) => {
    doc.text(column.header, tableLeft + i * colWidth + 5, tableTop + 10, {
      width: colWidth - 10,
    })
  })

  // Draw table rows
  let rowTop = tableTop + rowHeight

  // Handle data as array or convert if it's not
  const dataArray = Array.isArray(data) ? data : Object.values(data)

  dataArray.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (rowTop > doc.page.height - 50) {
      doc.addPage()
      rowTop = 50

      // Redraw headers on new page
      doc
        .fillColor("#f0f0f0")
        .rect(tableLeft, rowTop, doc.page.width - 100, rowHeight)
        .fill()

      doc.fillColor("#000")
      doc.font("Helvetica-Bold")
      columns.forEach((column, i) => {
        doc.text(column.header, tableLeft + i * colWidth + 5, rowTop + 10, {
          width: colWidth - 10,
        })
      })

      rowTop += rowHeight
    }

    // Draw row background (alternating colors)
    doc
      .fillColor(rowIndex % 2 === 0 ? "#ffffff" : "#f9f9f9")
      .rect(tableLeft, rowTop, doc.page.width - 100, rowHeight)
      .fill()

    // Draw cell borders
    doc
      .strokeColor("#e0e0e0")
      .lineWidth(0.5)
      .rect(tableLeft, rowTop, doc.page.width - 100, rowHeight)
      .stroke()

    // Draw cell content
    doc.fillColor("#000")
    doc.font("Helvetica")
    columns.forEach((column, i) => {
      const value = row[column.key] || ""
      doc.text(value.toString(), tableLeft + i * colWidth + 5, rowTop + 10, {
        width: colWidth - 10,
      })
    })

    rowTop += rowHeight
  })

  // Add footer
  doc
    .fontSize(10)
    .text("AqoonMaamul", 50, doc.page.height - 50, { align: "center" })

  return doc
}

/**
 * Generate a PDF for student records
 * @param {Array} students - Array of student objects
 * @returns {PDFDocument} - The generated PDF document
 */
export const generateStudentsPDF = (students) => {
  const columns = [
    { header: "ID", key: "id" },
    { header: "Name", key: "name" },
    { header: "Email", key: "email" },
    { header: "Department", key: "department" },
    { header: "Registration Date", key: "registrationDate" },
  ]

  return generatePDF(students, "Student Records", columns)
}

/**
 * Generate a PDF for course records
 * @param {Array} courses - Array of course objects
 * @returns {PDFDocument} - The generated PDF document
 */
export const generateCoursesPDF = (courses) => {
  const columns = [
    { header: "Code", key: "code" },
    { header: "Title", key: "title" },
    { header: "Credits", key: "credits" },
    { header: "Faculty", key: "faculty" },
    { header: "Department", key: "department" },
    { header: "Academic Year", key: "academicYear" },
    { header: "Semester", key: "semester" },
    { header: "Instructor", key: "instructor" },
  ]

  return generatePDF(courses, "Course Catalog", columns)
}

/**
 * Generate a PDF for payment records
 * @param {Array} payments - Array of payment objects
 * @returns {PDFDocument} - The generated PDF document
 */
export const generatePaymentsPDF = (payments) => {
  const columns = [
    { header: "ID", key: "id" },
    { header: "Student", key: "student" },
    { header: "Amount", key: "amount" },
    { header: "Type", key: "type" },
    { header: "Date", key: "date" },
    { header: "Status", key: "status" },
  ]

  return generatePDF(payments, "Payment Records", columns)
}

/**
 * Generate a PDF for enrollment trends report
 * @param {Array} data - Array of enrollment data objects
 * @param {Object} filters - Report filters (academicYear, semester)
 * @returns {PDFDocument} - The generated PDF document
 */
export const generateEnrollmentTrendsPDF = (data, filters) => {
  const { academicYear, semester } = filters
  const columns = [
    { header: "Month", key: "name" },
    { header: "Enrollment Count", key: "value" },
  ]

  const title = `Enrollment Trends - ${academicYear} ${semester}`
  return generatePDF(data, title, columns)
}

/**
 * Generate a PDF for faculty distribution report
 * @param {Array} data - Array of faculty distribution data objects
 * @param {Object} filters - Report filters (academicYear, semester)
 * @returns {PDFDocument} - The generated PDF document
 */
export const generateFacultyDistributionPDF = (data, filters) => {
  const { academicYear, semester } = filters
  const columns = [
    { header: "Faculty", key: "name" },
    { header: "Student Count", key: "value" },
  ]

  const title = `Faculty Distribution - ${academicYear} ${semester}`
  return generatePDF(data, title, columns)
}

/**
 * Generate a PDF for course enrollment report
 * @param {Array} data - Array of course enrollment data objects
 * @param {Object} filters - Report filters (academicYear, semester)
 * @returns {PDFDocument} - The generated PDF document
 */
export const generateCourseEnrollmentPDF = (data, filters) => {
  const { academicYear, semester } = filters
  const columns = [
    { header: "Course", key: "title" },
    { header: "Code", key: "code" },
    { header: "Students Enrolled", key: "students" },
    { header: "Department", key: "department" },
    { header: "Credits", key: "credits" },
    { header: "Instructor", key: "instructor" },
  ]

  const title = `Course Enrollment - ${academicYear} Semester - ${semester}`
  return generatePDF(data, title, columns)
}

/**
 * Generate a PDF for enrollment by department report
 * @param {Array} data - Array of enrollment by department data objects
 * @param {Object} filters - Report filters (academicYear, semester)
 * @returns {PDFDocument} - The generated PDF document
 */
export const generateEnrollmentByDepartmentPDF = (data, filters) => {
  const { academicYear, semester } = filters
  const columns = [
    { header: "Department", key: "department" },
    { header: "Faculty", key: "faculty" },
    { header: "Total Students", key: "totalStudents" },
    { header: "Male", key: "maleStudents" },
    { header: "Female", key: "femaleStudents" },
    { header: "Full Time", key: "fullTime" },
    { header: "Part Time", key: "partTime" },
  ]

  const title = `Enrollment by Department - ${academicYear} ${semester}`
  return generatePDF(data, title, columns)
}

/**
 * Generate a PDF for tuition fee income report
 * @param {Array} data - Array of tuition fee income data objects
 * @param {Object} filters - Report filters (academicYear, semester)
 * @returns {PDFDocument} - The generated PDF document
 */
export const generateTuitionFeeIncomePDF = (data, filters) => {
  const { academicYear, semester } = filters
  const columns = [
    { header: "Department", key: "department" },
    { header: "Batch", key: "batch" },
    { header: "Active Students", key: "activeStudents" },
    { header: "Total Tuition Fee", key: "totalTuitionFee" },
    { header: "Forwarded", key: "forwarded" },
    { header: "Discount", key: "discount" },
    { header: "Income Expected", key: "incomeExpected" },
    { header: "Accrued Income", key: "accruedIncome" },
    { header: "Deferred Income", key: "deferredIncome" },
  ]

  const title = `Tuition Fee Income Report - ${academicYear} ${semester} (Active Students Only)`
  return generatePDF(data, title, columns)
}
