import { PrismaClient } from "@prisma/client"
import chalk from "chalk"
import {
  generateEnrollmentTrendsPDF,
  generateFacultyDistributionPDF,
  generateCourseEnrollmentPDF,
  generateEnrollmentByDepartmentPDF,
  generateTuitionFeeIncomePDF,
} from "../utils/pdfGenerator.js"
import {
  generateEnrollmentTrendsExcel,
  generateFacultyDistributionExcel,
  generateCourseEnrollmentExcel,
  generateEnrollmentByDepartmentExcel,
  generateTuitionFeeIncomeExcel,
} from "../utils/excelGenerator.js"

const prisma = new PrismaClient()

// Data fetching functions for reports
const getEnrollmentTrendsData = async (academicYear, facultyId) => {
  try {
    const whereClause = {}
    if (academicYear) whereClause.academicYear = academicYear
    if (facultyId) whereClause.facultyId = facultyId

    // Get enrollment data grouped by month
    const enrollments = await prisma.student.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: whereClause,
      orderBy: { createdAt: "asc" },
    })

    // Transform to monthly data
    const monthlyData = {}
    enrollments.forEach((enrollment) => {
      const month = new Date(enrollment.createdAt).toLocaleString("default", {
        month: "short",
      })
      monthlyData[month] = (monthlyData[month] || 0) + enrollment._count.id
    })

    // Convert to array format
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]
    return months.map((month) => ({
      month,
      students: monthlyData[month] || 0,
    }))
  } catch (error) {
    console.error("Error fetching enrollment trends data:", error)
    return []
  }
}

const getFacultyDistributionData = async (academicYear, facultyId) => {
  try {
    const whereClause = {}
    if (academicYear) whereClause.academicYear = academicYear
    if (facultyId) whereClause.facultyId = facultyId

    // Get students grouped by faculty
    const facultyData = await prisma.faculty.findMany({
      select: {
        id: true,
        name: true,
        students: {
          where: whereClause,
          select: { id: true },
        },
      },
    })

    return facultyData.map((faculty) => ({
      name: faculty.name,
      value: faculty.students.length,
      students: faculty.students.length,
    }))
  } catch (error) {
    console.error("Error fetching faculty distribution data:", error)
    return []
  }
}

const getCourseEnrollmentData = async (academicYear, facultyId) => {
  try {
    const whereClause = {}
    if (academicYear) whereClause.academicYear = academicYear

    // If facultyId is provided, we need to filter courses by departments in that faculty
    let departmentFilter = {}
    if (facultyId) {
      const departments = await prisma.department.findMany({
        where: { facultyId },
        select: { id: true },
      })
      departmentFilter.departmentId = {
        in: departments.map((dept) => dept.id),
      }
    }

    // console.log("Course where clause:", { ...whereClause, ...departmentFilter })

    // Get courses with their department info
    const courses = await prisma.course.findMany({
      where: { ...whereClause, ...departmentFilter },
      select: {
        id: true,
        title: true,
        code: true,
        credits: true,
        instructor: true,
        academicYear: true,
        semester: true,
        departmentId: true,
        department: {
          select: {
            name: true,
            students: {
              where: facultyId ? { facultyId } : {},
              select: { id: true },
            },
          },
        },
      },
    })

    // console.log("Found courses:", courses.length)
    // console.log("Sample course:", courses[0])

    // Calculate course enrollment based on department students
    // For now, we'll show courses with their department's student count
    // In a real system, you might want to add a CourseEnrollment model
    const result = courses
      .map((course) => {
        const studentCount = course.department?.students?.length || 0
        // console.log(`Course ${course.title}: ${studentCount} students`)
        return {
          name: course.title,
          students: studentCount,
          department: course.department?.name || "Unknown",
          code: course.code,
          credits: course.credits,
          instructor: course.instructor,
          semester: parseInt(course.semester) || 1,
        }
      })
      .sort((a, b) => b.students - a.students)
      .slice(0, 10) // Top 10 courses

    // console.log("Final result:", result)
    return result
  } catch (error) {
    console.error("Error fetching course enrollment data:", error)
    return []
  }
}

const getEnrollmentByDepartmentData = async (academicYear, facultyId) => {
  try {
    const whereClause = {}
    if (academicYear) whereClause.academicYear = academicYear
    if (facultyId) whereClause.facultyId = facultyId

    // Get departments with student statistics
    const departmentFilter = {}
    if (facultyId) departmentFilter.facultyId = facultyId

    const departments = await prisma.department.findMany({
      where: departmentFilter,
      select: {
        id: true,
        name: true,
        faculty: {
          select: { name: true },
        },
        students: {
          where: { ...whereClause, isActive: true },
          select: {
            id: true,
            gender: true,
            session: true,
            // Add more fields as needed for full-time/part-time classification
          },
        },
      },
    })

    return departments.map((dept) => {
      const students = dept.students
      const maleStudents = students.filter((s) => s.gender === "male").length
      const femaleStudents = students.filter(
        (s) => s.gender === "female"
      ).length

      // Classify students as full-time or part-time based on session
      const fullTimeStudents = students.filter(
        (s) =>
          s.session &&
          (s.session.toLowerCase().includes("morning") ||
            s.session.toLowerCase().includes("full"))
      ).length
      const partTimeStudents = students.length - fullTimeStudents

      return {
        id: dept.id,
        department: dept.name,
        faculty: dept.faculty?.name || "Unknown",
        totalStudents: students.length,
        maleStudents,
        femaleStudents,
        fullTime: fullTimeStudents,
        partTime: partTimeStudents,
      }
    })
  } catch (error) {
    console.error("Error fetching enrollment by department data:", error)
    return []
  }
}

// NEW: Get tuition fee income data (Active Students Only)
const getTuitionFeeIncomeData = async (academicYear, facultyId) => {
  try {
    const whereClause = { isActive: true } // Only active students
    if (academicYear) whereClause.academicYear = academicYear
    if (facultyId) whereClause.facultyId = facultyId

    // Get departments with their student accounts for active students
    const departmentFilter = {}
    if (facultyId) departmentFilter.facultyId = facultyId

    const departments = await prisma.department.findMany({
      where: departmentFilter,
      select: {
        id: true,
        name: true,
        batch: true,
        students: {
          where: whereClause,
          select: {
            id: true,
            studentId: true,
            studentAccount: {
              where: { is_active: true },
              select: {
                tuitionFee: true,
                forwarded: true,
                discount: true,
                totalDue: true,
                paidAmount: true,
                academicYear: true,
              },
            },
          },
        },
      },
    })

    const result = []

    for (const dept of departments) {
      const activeStudents = dept.students.length
      if (activeStudents === 0) continue

      // Calculate financial data from student accounts
      let totalTuitionFee = 0
      let totalForwarded = 0
      let totalDiscount = 0
      let totalPaidAmount = 0
      let totalDue = 0

      dept.students.forEach((student) => {
        student.studentAccount.forEach((account) => {
          totalTuitionFee += account.tuitionFee || 0
          totalForwarded += account.forwarded || 0
          totalDiscount += account.discount || 0
          totalPaidAmount += account.paidAmount || 0
          totalDue += account.totalDue || 0
        })
      })

      // Calculate derived values
      const incomeExpected = totalTuitionFee - totalDiscount + totalForwarded
      const accruedIncome = totalPaidAmount
      const deferredIncome = incomeExpected - accruedIncome

      result.push({
        id: dept.id,
        department: dept.name,
        batch: dept.batch || "N/A",
        activeStudents,
        totalTuitionFee: Math.round(totalTuitionFee),
        forwarded: Math.round(totalForwarded),
        discount: Math.round(totalDiscount),
        incomeExpected: Math.round(incomeExpected),
        accruedIncome: Math.round(accruedIncome),
        deferredIncome: Math.round(deferredIncome),
      })
    }

    console.log("Tuition fee income result:", result)
    return result.sort((a, b) => b.totalTuitionFee - a.totalTuitionFee)
  } catch (error) {
    console.error("Error fetching tuition fee income data:", error)
    return []
  }
}

// NEW: Get payment summary data
const getPaymentSummaryData = async (academicYear, facultyId) => {
  try {
    // Get students based on filters
    const studentWhereClause = { isActive: true }
    if (academicYear) studentWhereClause.academicYear = academicYear
    if (facultyId) studentWhereClause.facultyId = facultyId

    const students = await prisma.student.findMany({
      where: studentWhereClause,
      select: {
        studentId: true,
        fullName: true,
        studentAccount: {
          where: { is_active: true },
          select: {
            tuitionFee: true,
            paidAmount: true,
            totalDue: true,
            discount: true,
            forwarded: true,
          },
        },
        payments: {
          select: {
            amount: true,
            paymentDate: true,
            dueDate: true,
          },
        },
      },
    })

    if (students.length === 0) {
      console.log(
        "No students found with the given filters - returning zero summary"
      )
      return {
        totalPayments: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
      }
    }

    let totalPayments = 0
    let totalPaid = 0
    let totalPending = 0
    let totalOverdue = 0

    const currentDate = new Date()

    students.forEach((student) => {
      // Get student's financial info from student account
      const account = student.studentAccount[0] // Assuming one active account per student
      if (!account) return

      // Calculate what student owes
      const tuitionFee = account.tuitionFee || 0
      const discount = account.discount || 0
      const forwarded = account.forwarded || 0
      const amountDue = tuitionFee - discount + forwarded

      // Calculate what student has actually paid (sum of all payments)
      const actualPayments = student.payments.reduce((sum, payment) => {
        return sum + (payment.amount || 0)
      }, 0)

      // Update the student account paid amount if it doesn't match actual payments
      const accountPaidAmount = account.paidAmount || 0
      const totalActualPaid = Math.max(actualPayments, accountPaidAmount)

      // Count this payment record
      totalPayments += student.payments.length

      if (totalActualPaid >= amountDue) {
        // Student has paid in full
        totalPaid += amountDue
      } else {
        // Student has outstanding balance
        const outstandingAmount = amountDue - totalActualPaid

        // Check if any payments are overdue (past due date)
        const hasOverduePayments = student.payments.some(
          (payment) =>
            payment.dueDate && new Date(payment.dueDate) < currentDate
        )

        if (hasOverduePayments || totalActualPaid === 0) {
          totalOverdue += outstandingAmount
        } else {
          totalPending += outstandingAmount
        }

        // Add what they have paid so far to totalPaid
        totalPaid += totalActualPaid
      }
    })

    const result = {
      totalPayments,
      totalPaid: Math.round(totalPaid),
      totalPending: Math.round(totalPending),
      totalOverdue: Math.round(totalOverdue),
    }

    return result
  } catch (error) {
    console.error("Error fetching payment summary data:", error)
    return {
      totalPayments: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
    }
  }
}

// API endpoints for data retrieval
export const getEnrollmentTrendsDataAPI = async (req, res) => {
  try {
    const { academicYear, facultyId } = req.query
    const data = await getEnrollmentTrendsData(academicYear, facultyId)

    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching enrollment trends data:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollment trends data",
      error: error.message,
    })
  }
}

export const getFacultyDistributionDataAPI = async (req, res) => {
  try {
    const { academicYear, facultyId } = req.query
    const data = await getFacultyDistributionData(academicYear, facultyId)

    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching faculty distribution data:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty distribution data",
      error: error.message,
    })
  }
}

export const getCourseEnrollmentDataAPI = async (req, res) => {
  try {
    const { academicYear, facultyId } = req.query

    const data = await getCourseEnrollmentData(academicYear, facultyId)
    // console.log("Course enrollment data result:", data)

    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching course enrollment data:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch course enrollment data",
      error: error.message,
    })
  }
}

export const getEnrollmentByDepartmentDataAPI = async (req, res) => {
  try {
    const { academicYear, facultyId } = req.query
    const data = await getEnrollmentByDepartmentData(academicYear, facultyId)

    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching enrollment by department data:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollment by department data",
      error: error.message,
    })
  }
}

// NEW: API endpoint for tuition fee income data
export const getTuitionFeeIncomeDataAPI = async (req, res) => {
  try {
    const { academicYear, facultyId } = req.query

    const data = await getTuitionFeeIncomeData(academicYear, facultyId)

    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching tuition fee income data:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch tuition fee income data",
      error: error.message,
    })
  }
}

// NEW: API endpoint for payment summary data
export const getPaymentSummaryDataAPI = async (req, res) => {
  try {
    const { academicYear, facultyId } = req.query

    const data = await getPaymentSummaryData(academicYear, facultyId)

    res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching payment summary data:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment summary data",
      error: error.message,
    })
  }
}

/**
 * Export enrollment trends report as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportEnrollmentTrendsPDF = async (req, res) => {
  try {
    const { academicYear, semester } = req.query

    if (!academicYear || !semester) {
      return res
        .status(400)
        .json({ message: "Academic year and semester are required" })
    }

    // Get data for the report
    const data = await getEnrollmentTrendsData(academicYear, null)

    // Generate PDF
    const doc = generateEnrollmentTrendsPDF(data, { academicYear, semester })

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=enrollment-trends-${academicYear}-${semester}.pdf`
    )

    // Pipe the PDF to the response
    doc.pipe(res)
    doc.end()
  } catch (error) {
    console.error("Error exporting enrollment trends PDF:", error)
    res.status(500).json({
      message: "Failed to export enrollment trends data",
      error: error.message,
    })
  }
}

/**
 * Export enrollment trends report as Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportEnrollmentTrendsExcel = async (req, res) => {
  try {
    const { academicYear, semester } = req.query

    if (!academicYear || !semester) {
      return res
        .status(400)
        .json({ message: "Academic year and semester are required" })
    }

    // Get data for the report
    const data = await getEnrollmentTrendsData(academicYear, null)

    // Generate Excel workbook
    const workbook = await generateEnrollmentTrendsExcel(data, {
      academicYear,
      semester,
    })

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=enrollment-trends-${academicYear}-${semester}.xlsx`
    )

    // Write workbook to response
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Error exporting enrollment trends Excel:", error)
    res.status(500).json({
      message: "Failed to export enrollment trends data",
      error: error.message,
    })
  }
}

/**
 * Export faculty distribution report as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportFacultyDistributionPDF = async (req, res) => {
  try {
    const { academicYear, semester } = req.query

    if (!academicYear || !semester) {
      return res
        .status(400)
        .json({ message: "Academic year and semester are required" })
    }

    // Get data for the report
    const data = await getFacultyDistributionData(academicYear, null)

    // Generate PDF
    const doc = generateFacultyDistributionPDF(data, { academicYear, semester })

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=faculty-distribution-${academicYear}-${semester}.pdf`
    )

    // Pipe the PDF to the response
    doc.pipe(res)
    doc.end()
  } catch (error) {
    console.error("Error exporting faculty distribution PDF:", error)
    res.status(500).json({
      message: "Failed to export faculty distribution data",
      error: error.message,
    })
  }
}

/**
 * Export faculty distribution report as Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportFacultyDistributionExcel = async (req, res) => {
  try {
    const { academicYear, semester } = req.query

    if (!academicYear || !semester) {
      return res
        .status(400)
        .json({ message: "Academic year and semester are required" })
    }

    // Get data for the report
    const data = await getFacultyDistributionData(academicYear, null)

    // Generate Excel workbook
    const workbook = await generateFacultyDistributionExcel(data, {
      academicYear,
      semester,
    })

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=faculty-distribution-${academicYear}-${semester}.xlsx`
    )

    // Write workbook to response
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Error exporting faculty distribution Excel:", error)
    res.status(500).json({
      message: "Failed to export faculty distribution data",
      error: error.message,
    })
  }
}

/**
 * Export course enrollment report as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportCourseEnrollmentPDF = async (req, res) => {
  try {
    const { academicYear, semester } = req.query

    if (!academicYear || !semester) {
      return res
        .status(400)
        .json({ message: "Academic year and semester are required" })
    }

    // Get data for the report
    const data = await getCourseEnrollmentData(academicYear, null)

    // Generate PDF
    const doc = generateCourseEnrollmentPDF(data, { academicYear, semester })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `inline; filename=course-enrollment-${academicYear}-${semester}.pdf`
    )
    res.setHeader("Cache-Control", "public, max-age=0")
    res.setHeader("X-Content-Type-Options", "nosniff")

    doc.pipe(res)
    doc.end()
  } catch (error) {
    console.error("Error exporting course enrollment PDF:", error)
    res.status(500).json({
      message: "Failed to export course enrollment data",
      error: error.message,
    })
  }
}

/**
 * Export course enrollment report as Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportCourseEnrollmentExcel = async (req, res) => {
  try {
    const { academicYear, semester } = req.query

    if (!academicYear || !semester) {
      return res
        .status(400)
        .json({ message: "Academic year and semester are required" })
    }

    // Get data for the report
    const data = await getCourseEnrollmentData(academicYear, null)

    // Generate Excel workbook
    const workbook = await generateCourseEnrollmentExcel(data, {
      academicYear,
      semester,
    })

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=course-enrollment-${academicYear}-${semester}.xlsx`
    )

    // Write workbook to response
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Error exporting course enrollment Excel:", error)
    res.status(500).json({
      message: "Failed to export course enrollment data",
      error: error.message,
    })
  }
}

/**
 * Export enrollment by department report as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportEnrollmentByDepartmentPDF = async (req, res) => {
  try {
    const { academicYear, semester } = req.query

    if (!academicYear || !semester) {
      return res
        .status(400)
        .json({ message: "Academic year and semester are required" })
    }

    // Get data for the report
    const data = await getEnrollmentByDepartmentData(academicYear, null)

    // Generate PDF
    const doc = generateEnrollmentByDepartmentPDF(data, {
      academicYear,
      semester,
    })

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=enrollment-by-department-${academicYear}-${semester}.pdf`
    )

    // Pipe the PDF to the response
    doc.pipe(res)
    doc.end()
  } catch (error) {
    console.error("Error exporting enrollment by department PDF:", error)
    res.status(500).json({
      message: "Failed to export enrollment by department data",
      error: error.message,
    })
  }
}

/**
 * Export enrollment by department report as Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportEnrollmentByDepartmentExcel = async (req, res) => {
  try {
    const { academicYear, semester } = req.query

    if (!academicYear || !semester) {
      return res
        .status(400)
        .json({ message: "Academic year and semester are required" })
    }

    // Get data for the report
    const data = await getEnrollmentByDepartmentData(academicYear, null)

    // Generate Excel workbook
    const workbook = await generateEnrollmentByDepartmentExcel(data, {
      academicYear,
      semester,
    })

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=enrollment-by-department-${academicYear}-${semester}.xlsx`
    )

    // Write workbook to response
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Error exporting enrollment by department Excel:", error)
    res.status(500).json({
      message: "Failed to export enrollment by department data",
      error: error.message,
    })
  }
}

// Test endpoint to check courses
export const testCoursesAPI = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        code: true,
        academicYear: true,
        departmentId: true,
        department: {
          select: { name: true },
        },
      },
    })

    res.status(200).json({
      success: true,
      data: courses,
    })
  } catch (error) {
    console.error("Error fetching test courses:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch test courses",
      error: error.message,
    })
  }
}

/**
 * Export tuition fee income report as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportTuitionFeeIncomePDF = async (req, res) => {
  try {
    const { academicYear, semester } = req.query

    if (!academicYear || !semester) {
      return res
        .status(400)
        .json({ message: "Academic year and semester are required" })
    }

    // Get data for the report
    const data = await getTuitionFeeIncomeData(academicYear, null)

    // Generate PDF
    const doc = generateTuitionFeeIncomePDF(data, { academicYear, semester })

    // Set response headers
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `inline; filename=tuition-fee-income-${academicYear}-${semester}.pdf`
    )
    res.setHeader("Cache-Control", "public, max-age=0")
    res.setHeader("X-Content-Type-Options", "nosniff")

    doc.pipe(res)
    doc.end()
  } catch (error) {
    console.error("Error exporting tuition fee income PDF:", error)
    res.status(500).json({
      message: "Failed to export tuition fee income data",
      error: error.message,
    })
  }
}

/**
 * Export tuition fee income report as Excel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportTuitionFeeIncomeExcel = async (req, res) => {
  try {
    const { academicYear, semester } = req.query

    if (!academicYear || !semester) {
      return res
        .status(400)
        .json({ message: "Academic year and semester are required" })
    }

    // Get data for the report
    const data = await getTuitionFeeIncomeData(academicYear, null)

    // Generate Excel workbook
    const workbook = await generateTuitionFeeIncomeExcel(data, {
      academicYear,
      semester,
    })

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=tuition-fee-income-${academicYear}-${semester}.xlsx`
    )

    // Write workbook to response
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Error exporting tuition fee income Excel:", error)
    res.status(500).json({
      message: "Failed to export tuition fee income data",
      error: error.message,
    })
  }
}

// DEBUG: Test endpoint to debug payment summary issues
export const debugPaymentSummaryAPI = async (req, res) => {
  try {
    // 1. Check total payments in database
    const totalPaymentsInDB = await prisma.payment.count()

    // 2. Check payment status distribution
    const paymentStatusDistribution = await prisma.payment.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { amount: true },
    })
    console.log("Payment status distribution:", paymentStatusDistribution)

    // 3. Check sample payments
    const samplePayments = await prisma.payment.findMany({
      take: 5,
      select: {
        id: true,
        studentId: true,
        amount: true,
        status: true,
        createdAt: true,
        student: {
          select: {
            studentId: true,
            fullName: true,
            academicYear: true,
            facultyId: true,
          },
        },
      },
    })
    // console.log("Sample payments:", samplePayments)

    // 4. Check students with academic year and faculty
    const studentsWithYearAndFaculty = await prisma.student.findMany({
      take: 5,
      select: {
        studentId: true,
        fullName: true,
        academicYear: true,
        facultyId: true,
        faculty: {
          select: { name: true },
        },
      },
    })

    // 5. Test payment summary without filters
    const summaryNoFilters = await getPaymentSummaryData(null, null)
    console.log("Payment summary with no filters:", summaryNoFilters)

    // 6. Test with current filters
    const { academicYear, facultyId } = req.query
    if (academicYear || facultyId) {
      const summaryWithFilters = await getPaymentSummaryData(
        academicYear,
        facultyId
      )
      console.log(
        `Payment summary with filters (academicYear: ${academicYear}, facultyId: ${facultyId}):`,
        summaryWithFilters
      )
    }

    res.status(200).json({
      success: true,
      debug: {
        totalPaymentsInDB,
        paymentStatusDistribution,
        samplePayments,
        studentsWithYearAndFaculty,
        summaryNoFilters,
        filters: { academicYear, facultyId },
      },
    })
  } catch (error) {
    console.error("Error in debug payment summary:", error)
    res.status(500).json({
      success: false,
      message: "Failed to debug payment summary",
      error: error.message,
    })
  }
}
