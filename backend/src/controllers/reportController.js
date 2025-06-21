import { PrismaClient } from "@prisma/client"
import {
  generateEnrollmentTrendsPDF,
  generateFacultyDistributionPDF,
  generateCourseEnrollmentPDF,
  generateEnrollmentByDepartmentPDF,
} from "../utils/pdfGenerator.js"
import {
  generateEnrollmentTrendsExcel,
  generateFacultyDistributionExcel,
  generateCourseEnrollmentExcel,
  generateEnrollmentByDepartmentExcel,
} from "../utils/excelGenerator.js"

const prisma = new PrismaClient()

// Data fetching functions for reports
const getEnrollmentTrendsData = async (academicYear, departmentId) => {
  try {
    const whereClause = {}
    if (academicYear) whereClause.academicYear = academicYear
    if (departmentId) whereClause.departmentId = departmentId

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

const getFacultyDistributionData = async (academicYear, departmentId) => {
  try {
    const whereClause = {}
    if (academicYear) whereClause.academicYear = academicYear
    if (departmentId) whereClause.departmentId = departmentId

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

const getCourseEnrollmentData = async (academicYear, departmentId) => {
  try {
    const whereClause = {}
    if (academicYear) whereClause.academicYear = academicYear
    if (departmentId) whereClause.departmentId = departmentId

    // Get courses with student count
    const courses = await prisma.course.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        department: {
          select: { name: true },
        },
        students: {
          select: { id: true },
        },
      },
    })

    return courses
      .map((course) => ({
        name: course.title,
        students: course.students.length,
        department: course.department?.name || "Unknown",
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 10) // Top 10 courses
  } catch (error) {
    console.error("Error fetching course enrollment data:", error)
    return []
  }
}

const getEnrollmentByDepartmentData = async (academicYear, departmentId) => {
  try {
    const whereClause = {}
    if (academicYear) whereClause.academicYear = academicYear
    if (departmentId) whereClause.departmentId = departmentId

    // Get departments with student statistics
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        faculty: {
          select: { name: true },
        },
        students: {
          where: whereClause,
          select: {
            id: true,
            gender: true,
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

      return {
        id: dept.id,
        department: dept.name,
        faculty: dept.faculty?.name || "Unknown",
        totalStudents: students.length,
        maleStudents,
        femaleStudents,
        fullTime: students.length, // Assuming all students are full-time for now
        partTime: 0,
      }
    })
  } catch (error) {
    console.error("Error fetching enrollment by department data:", error)
    return []
  }
}

// API endpoints for data retrieval
export const getEnrollmentTrendsDataAPI = async (req, res) => {
  try {
    const { academicYear, departmentId } = req.query
    const data = await getEnrollmentTrendsData(academicYear, departmentId)

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
    const { academicYear, departmentId } = req.query
    const data = await getFacultyDistributionData(academicYear, departmentId)

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
    const { academicYear, departmentId } = req.query
    const data = await getCourseEnrollmentData(academicYear, departmentId)

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
    const { academicYear, departmentId } = req.query
    const data = await getEnrollmentByDepartmentData(academicYear, departmentId)

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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
        message: "Failed to export enrollment by department data",
        error: error.message,
      })
  }
}
