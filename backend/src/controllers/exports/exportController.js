import { PrismaClient } from "@prisma/client"
import {
  generateStudentsPDF,
  generateCoursesPDF,
  generatePaymentsPDF,
} from "../../utils/pdfGenerator.js"
import {
  generateStudentsExcel,
  generateCoursesExcel,
  generatePaymentsExcel,
} from "../../utils/excelGenerator.js"

const prisma = new PrismaClient()

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
        faculty: true,
        studentAccount: true,
      },
    })

    // Format data for PDF
    const formattedStudents = students.map((student) => ({
      studentId: student.studentId,
      fullName: student.fullName,
      phoneNumber: student.phoneNumber,
      faculty: student.faculty?.name || "N/A",
      department: student.department?.name || "N/A",
      batch: student.department?.batch || "N/A",
      semester: student.semester,
      session: student.session,
      status: student.isActive,
    }))

    // Generate PDF
    const doc = generateStudentsPDF(formattedStudents)

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=students.pdf")

    // Pipe the PDF to the response
    doc.pipe(res)
    doc.end()
  } catch (error) {
    console.error("Error exporting students PDF:", error)
    res
      .status(500)
      .json({ message: "Failed to export students data", error: error.message })
  }
}

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
        faculty: true,
        studentAccount: true,
      },
    })

    // Format data for Excel
    const formattedStudents = students.map((student) => ({
      studentId: student.studentId,
      fullName: student.fullName,
      phoneNumber: student.phoneNumber,
      faculty: student.faculty?.name || "N/A",
      department: student.department?.name || "N/A",
      batch: student.department?.batch || "N/A",
      semester: student.semester,
      session: student.session,
      status: student.isActive,
    }))

    // Generate Excel workbook
    const workbook = await generateStudentsExcel(formattedStudents)

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx")

    // Write workbook to response
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Error exporting students Excel:", error)
    res
      .status(500)
      .json({ message: "Failed to export students data", error: error.message })
  }
}

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
        //   faculty: true,
        department: true,
      },
    })

    // Format data for PDF
    const formattedCourses = courses.map((course) => ({
      code: course.code,
      title: course.title,
      credits: course.credits.toString(),
      faculty: course.faculty?.name || "N/A",
      department: course.department?.name || "N/A",
      academicYear: course.academicYear,
      semester: course.semester,
      instructor: course.instructor || "N/A",
    }))

    // Generate PDF
    const doc = generateCoursesPDF(formattedCourses)

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=courses.pdf")

    // Pipe the PDF to the response
    doc.pipe(res)
    doc.end()
  } catch (error) {
    console.error("Error exporting courses PDF:", error)
    res
      .status(500)
      .json({ message: "Failed to export courses data", error: error.message })
  }
}

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
      },
    })

    // Format data for Excel
    const formattedCourses = courses.map((course) => ({
      code: course.code,
      title: course.title,
      credits: course.credits,
      department: course.department?.name || "N/A",
      academicYear: course.academicYear,
      semester: course.semester,
      instructor: course.instructor || "N/A",
    }))

    // Generate Excel workbook
    const workbook = await generateCoursesExcel(formattedCourses)

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    res.setHeader("Content-Disposition", "attachment; filename=courses.xlsx")

    // Write workbook to response
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Error exporting courses Excel:", error)
    res
      .status(500)
      .json({ message: "Failed to export courses data", error: error.message })
  }
}

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
        student: true,
      },
    })
    const student = await prisma.student.findUnique({
      where: { studentId: payments.studentId },
      include: {
        department: true,
        faculty: true,
        studentAccount: true,
      },
    })

    // Format data for PDF
    const formattedPayments = payments.map((payment) => ({
      studentId: payment.student?.studentId || "Unknown",
      fullName: payment.student?.fullName || "Unknown",
      batch: student.department?.batch || "Unknown",
      semester: student.semester,
      session: student.session,
      amount: `$${payment.amount.toFixed(2)}`,
      date: new Date(payment.paymentDate).toLocaleDateString(),
      type: payment.paymentType,
      method: payment.paymentMethod,
    }))

    // Generate PDF
    const doc = generatePaymentsPDF(formattedPayments)

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=payments.pdf")

    // Pipe the PDF to the response
    doc.pipe(res)
    doc.end()
  } catch (error) {
    console.error("Error exporting payments PDF:", error)
    res
      .status(500)
      .json({ message: "Failed to export payments data", error: error.message })
  }
}

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
      },
    })
    const student = await prisma.student.findMany({
      include: {
        department: true,
        studentAccount: true,
      },
    })

    // Format data for Excel
    const formattedPayments = payments.map((payment) => ({
      studentId: payment.student?.studentId || "Unknown",
      fullName: payment.student?.fullName || "Unknown",
      batch: student.department?.batch || "Unknown",
      semester: student.semester,
      session: student.session,

      date: new Date(payment.paymentDate).toLocaleDateString(),
      type: payment.paymentType,
      method: payment.paymentMethod,
    }))

    // Generate Excel workbook
    const workbook = await generatePaymentsExcel(formattedPayments)

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    res.setHeader("Content-Disposition", "attachment; filename=payments.xlsx")

    // Write workbook to response
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Error exporting payments Excel:", error)
    res
      .status(500)
      .json({ message: "Failed to export payments data", error: error.message })
  }
}
