import { prisma } from "../../config/db.js"

/**
 * Get admin dashboard statistics
 * @route GET /api/dashboard/admin
 * @access Private (Admin)
 */
export const getAdminStats = async (req, res) => {
  try {
    // Get counts from all relevant models
    const [studentsCount, facultiesCount, departmentsCount, coursesCount] =
      await Promise.all([
        prisma.student.count(),
        prisma.faculty.count(),
        prisma.department.count(),
        prisma.course.count(),
      ])

    // Get recent enrollments for chart data
    const currentYear = new Date().getFullYear()
    const enrollmentsByMonth = await prisma.student.groupBy({
      by: ["registerYear"],
      _count: {
        id: true,
      },
      where: {
        registerYear: {
          gte: currentYear - 5, // Last 5 years
        },
      },
      orderBy: {
        registerYear: "asc",
      },
    })

    // Transform enrollment data for chart
    const enrollmentTrends = enrollmentsByMonth.map((item) => ({
      year: item.registerYear,
      students: item._count.id,
    }))

    // Return all statistics
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents: studentsCount,
          totalFaculties: facultiesCount,
          totalDepartments: departmentsCount,
          totalCourses: coursesCount,
        },
        enrollmentTrends,
      },
    })
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    })
  }
}

/**
 * Get financial dashboard statistics
 * @route GET /api/dashboard/financial
 * @access Private (Financial)
 */
export const getFinancialStats = async (req, res) => {
  try {
    // Get payment statistics
    const [totalPayments, pendingPayments, paidPayments, overduePayments] =
      await Promise.all([
        prisma.payment.count(),
        prisma.payment.count({ where: { status: "pending" } }),
        prisma.payment.count({ where: { status: "paid" } }),
        prisma.payment.count({ where: { status: "overdue" } }),
      ])

    // Get total amounts
    const totalAmountResult = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
    })

    const totalAmount = totalAmountResult._sum.amount || 0

    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: {
        paymentDate: "desc",
      },
      include: {
        student: {
          select: {
            fullName: true,
            studentId: true,
          },
        },
      },
    })

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalPayments,
          pendingPayments,
          paidPayments,
          overduePayments,
          totalAmount,
        },
        recentPayments,
      },
    })
  } catch (error) {
    console.error("Error fetching financial dashboard stats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch financial statistics",
      error: error.message,
    })
  }
}

/**
 * Get admission dashboard statistics
 * @route GET /api/dashboard/admission
 * @access Private (Admission)
 */
export const getAdmissionStats = async (req, res) => {
  try {
    // Get student statistics by gender
    const [maleStudents, femaleStudents] = await Promise.all([
      prisma.student.count({ where: { gender: "male" } }),
      prisma.student.count({ where: { gender: "female" } }),
    ])

    // Get students by faculty
    const studentsByFaculty = await prisma.faculty.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    // Get students by department
    const studentsByDepartment = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      take: 10,
      orderBy: {
        students: {
          _count: "desc",
        },
      },
    })

    // Get recent students
    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        faculty: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
    })

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents: maleStudents + femaleStudents,
          maleStudents,
          femaleStudents,
        },
        studentsByFaculty: studentsByFaculty.map((faculty) => ({
          name: faculty.name,
          count: faculty._count.students,
        })),
        studentsByDepartment: studentsByDepartment.map((dept) => ({
          name: dept.name,
          count: dept._count.students,
        })),
        recentStudents,
      },
    })
  } catch (error) {
    console.error("Error fetching admission dashboard stats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch admission statistics",
      error: error.message,
    })
  }
}

/**
 * Get student dashboard statistics
 * @route GET /api/dashboard/student/:studentId
 * @access Private (Student - own record only)
 */
export const getStudentStats = async (req, res) => {
  try {
    const { studentId } = req.params

    // Check if the student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        faculty: true,
        department: true,
        payments: true,
      },
    })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Get payment statistics
    const totalPayments = student.payments.length
    const pendingPayments = student.payments.filter(
      (p) => p.status === "pending"
    ).length
    const paidPayments = student.payments.filter(
      (p) => p.status === "paid"
    ).length
    const overduePayments = student.payments.filter(
      (p) => p.status === "overdue"
    ).length

    // Calculate total amount paid and due
    const totalPaid = student.payments
      .filter((p) => p.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0)

    const totalDue = student.payments
      .filter((p) => p.status === "pending" || p.status === "overdue")
      .reduce((sum, payment) => sum + payment.amount, 0)

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student.id,
          studentId: student.studentId,
          fullName: student.fullName,
          email: student.email,
          faculty: student.faculty.name,
          department: student.department.name,
          semester: student.semester,
          session: student.session,
        },
        stats: {
          totalPayments,
          pendingPayments,
          paidPayments,
          overduePayments,
          totalPaid,
          totalDue,
        },
        payments: student.payments,
      },
    })
  } catch (error) {
    console.error("Error fetching student dashboard stats:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch student statistics",
      error: error.message,
    })
  }
}
