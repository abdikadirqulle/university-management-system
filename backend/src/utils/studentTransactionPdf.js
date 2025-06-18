import PDFDocument from "pdfkit"

/**
 * Generate a PDF document for student transactions
 * @param {Object} student - The student data
 * @param {Array} transactions - The transaction data for the student
 * @returns {PDFDocument} - The generated PDF document
 */
export const generateStudentTransactionPDF = (student, transactions) => {
  // Create a new PDF document
  const doc = new PDFDocument({ margin: 50 })

  // Add university logo/header
  doc.fontSize(20).text("AqoonMaamul", { align: "center" })
  doc.moveDown(0.5)

  // Add document title
  doc.fontSize(16).text("Student Transaction Statement", { align: "center" })
  doc.moveDown()

  // Add generation date
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, {
    align: "right",
  })
  doc.moveDown()

  // Add student information section
  doc.fontSize(12).font("Helvetica-Bold").text("Student Information")
  doc.moveDown(0.5)

  // Create a light gray background for student info
  doc
    .fillColor("#f6f6f6")
    .rect(50, doc.y, doc.page.width - 100, 80)
    .fill()

  // Reset text color and position
  doc.fillColor("#000").font("Helvetica")

  // Add student details
  const studentInfoY = doc.y + 10
  doc.text(`Student ID: ${student.studentId}`, 60, studentInfoY)
  doc.text(`Name: ${student.fullName}`, 60, studentInfoY + 15)
  doc.text(`Email: ${student.phoneNumber}`, 60, studentInfoY + 30)
  doc.text(
    `Department: ${student.department?.name || "N/A"}`,
    60,
    studentInfoY + 45
  )

  // Move down after student info box
  //   doc.moveDown(4)

  // Add transaction summary
  //   doc.fontSize(12).font("Helvetica-Bold").text("Transaction Summary")
  //   doc.moveDown(0.5)

  // Calculate summary values
  const totalPaid = transactions.reduce((sum, t) => sum + t.paidAmount, 0)
  const totalPending = transactions.reduce((sum, t) => sum + t.amount, 0)
  const totalDue = transactions.reduce((sum, t) => sum + t.totalDue, 0)

  // Create a summary box
  doc
    .fillColor("#f6f6f6")
    .rect(50, doc.y, doc.page.width - 100, 60)
    .fill()

  // Reset text color and position
  doc.fillColor("#000")

  // Add summary details
  const summaryY = doc.y + 10
  //   doc.text(`Total Paid: $${totalPaid.toFixed(2)}`, 60, summaryY)
  //   doc.text(`Pending Payments: $${totalPending.toFixed(2)}`, 60, summaryY + 15)
  //   doc.text(`Outstanding Balance: $${totalDue.toFixed(2)}`, 60, summaryY + 30)

  // Move down after summary box
  doc.moveDown(4)

  // Add transactions table
  doc.fontSize(12).font("Helvetica-Bold").text("Transaction History")
  doc.moveDown()

  // Define table dimensions
  const tableTop = doc.y
  const tableLeft = 50
  const rowHeight = 30

  // Define columns and their widths
  const columns = [
    { header: "Date", key: "date", width: 80 },
    { header: "Type", key: "type", width: 100 },
    { header: "Amount", key: "amount", width: 80 },
    { header: "Status", key: "status", width: 80 },
    { header: "Reference", key: "description", width: 150 },
  ]

  // Calculate total width
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0)

  // Draw header row
  doc
    .fillColor("#f0f0f0")
    .rect(tableLeft, tableTop, totalWidth, rowHeight)
    .fill()

  // Draw header text
  doc.fillColor("#000").font("Helvetica-Bold")
  let xPos = tableLeft

  columns.forEach((column) => {
    doc.text(column.header, xPos + 5, tableTop + 10)
    xPos += column.width
  })

  // Draw table rows
  let rowTop = tableTop + rowHeight

  transactions.forEach((transaction, i) => {
    // Check if we need a new page
    if (rowTop > doc.page.height - 50) {
      doc.addPage()
      rowTop = 50

      // Redraw header on new page
      doc
        .fillColor("#f0f0f0")
        .rect(tableLeft, rowTop, totalWidth, rowHeight)
        .fill()

      // Redraw header text
      doc.fillColor("#000").font("Helvetica-Bold")
      xPos = tableLeft

      columns.forEach((column) => {
        doc.text(column.header, xPos + 5, rowTop + 10)
        xPos += column.width
      })

      rowTop += rowHeight
    }

    // Draw row background (alternating colors)
    doc
      .fillColor(i % 2 === 0 ? "#ffffff" : "#f9f9f9")
      .rect(tableLeft, rowTop, totalWidth, rowHeight)
      .fill()

    // Draw cell borders
    doc
      .strokeColor("#e0e0e0")
      .lineWidth(0.5)
      .rect(tableLeft, rowTop, totalWidth, rowHeight)
      .stroke()

    // Draw cell content
    doc.fillColor("#000").font("Helvetica")
    xPos = tableLeft

    // Format date
    const date = new Date(transaction.paymentDate).toLocaleDateString()
    doc.text(date, xPos + 5, rowTop + 10)
    xPos += columns[0].width

    // Payment type
    doc.text(transaction.type, xPos + 5, rowTop + 10)
    xPos += columns[1].width

    // Amount
    doc.text(`$${transaction.amount.toFixed(2)}`, xPos + 5, rowTop + 10)
    xPos += columns[2].width

    // Status with color coding
    let statusColor
    switch (transaction.status) {
      case "PAID":
        statusColor = "#10b981" // Green
        break
      case "PENDING":
        statusColor = "#f59e0b" // Amber
        break
      case "DUE":
        statusColor = "#ef4444" // Red
        break
      default:
        statusColor = "#000000"
    }

    doc.fillColor(statusColor).text(transaction.status, xPos + 5, rowTop + 10)
    xPos += columns[3].width

    // Reset text color
    doc.fillColor("#000")

    // Reference/Description
    doc.text(transaction.description || "N/A", xPos + 5, rowTop + 10)

    rowTop += rowHeight
  })

  // Add footer
  doc
    .fontSize(10)
    .text(
      "This is an official financial statement from the University Management System.",
      50,
      doc.page.height - 50,
      { align: "center" }
    )

  return doc
}
