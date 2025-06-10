import { prisma } from "../config/db.js"

/**
 * Get all students
 * @route GET /api/students
 * @access Private (Admin, Admission)
 */
const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        faculty: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
            batch: true,
          },
        },
        payments: true,
        studentAccount: true,
      },
    })

    res
      .status(200)
      .json({ success: true, count: students.length, data: students })
  } catch (error) {
    console.error("Error fetching students:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

/**
 * Get student by ID
 * @route GET /api/students/:id
 * @access Private (Admin, Admission, Student - own record only)
 */
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        faculty: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
            batch: true,
          },
        },
        payments: true,
        studentAccount: true,
      },
    })

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" })
    }

    res.status(200).json({ success: true, data: student })
  } catch (error) {
    console.error("Error fetching student:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

/**
 * Create new student
 * @route POST /api/students
 * @access Private (Admin, Admission)
 */
const createStudent = async (req, res) => {
  try {
    const {
      studentId,
      userId,
      fullName,
      gender,
      dateOfBirth,
      placeOfBirth,
      email,
      phoneNumber,
      highSchoolName,
      highSchoolCity,
      graduationYear,
      averagePass,
      facultyId,
      departmentId,
      session,
      academicYear,
      registerYear,
      semester,
    } = req.body

    // Check if student ID already exists
    const existingStudentId = await prisma.student.findUnique({
      where: { studentId },
    })

    if (existingStudentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID already exists",
      })
    }

    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    })

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      })
    }

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    })

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    const student = await prisma.student.create({
      data: {
        studentId,
        // userId,
        fullName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        placeOfBirth,
        email,
        phoneNumber,
        highSchoolName,
        highSchoolCity,
        graduationYear: parseInt(graduationYear),
        averagePass: parseFloat(averagePass),
        facultyId,
        departmentId,
        session,
        academicYear,
        registerYear: parseInt(registerYear),
        semester,
        is_active: true,
      },
    })

    const account = await prisma.studentAccount.create({
      data: {
        studentId: student.studentId,
        academicYear: student.academicYear,
        semester: student.semester,
        tuitionFee: department.price,
        discount: 0,
        paidAmount: 0,
        totalDue: department.price,
        status: "pending",
      },
    })

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: {
        ...student,
        studentAccount: account,
      },
    })
  } catch (error) {
    console.error("Error creating student:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

/**
 * Update student
 * @route PUT /api/students/:id
 * @access Private (Admin, Admission)
 */
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params
    const {
      fullName,
      gender,
      dateOfBirth,
      placeOfBirth,
      email,
      phoneNumber,
      highSchoolName,
      highSchoolCity,
      graduationYear,
      averagePass,
      facultyId,
      departmentId,
      session,
      academicYear,
      registerYear,
      semester,
    } = req.body

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    })

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Check if email already exists (excluding current student)
    if (email !== existingStudent.email) {
      const existingEmail = await prisma.student.findUnique({
        where: { email },
      })

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        })
      }
    }

    // Check if faculty exists
    if (facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
      })

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty not found",
        })
      }
    }

    // Check if department exists

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    })

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        fullName: fullName || existingStudent.fullName,
        gender: gender || existingStudent.gender,
        dateOfBirth: dateOfBirth
          ? new Date(dateOfBirth)
          : existingStudent.dateOfBirth,
        placeOfBirth: placeOfBirth || existingStudent.placeOfBirth,
        email: email || existingStudent.email,
        phoneNumber: phoneNumber || existingStudent.phoneNumber,
        highSchoolName: highSchoolName || existingStudent.highSchoolName,
        highSchoolCity: highSchoolCity || existingStudent.highSchoolCity,
        graduationYear: graduationYear
          ? parseInt(graduationYear)
          : existingStudent.graduationYear,
        averagePass: averagePass
          ? parseFloat(averagePass)
          : existingStudent.averagePass,
        facultyId: facultyId || existingStudent.facultyId,
        departmentId: departmentId || existingStudent.departmentId,
        session: session || existingStudent.session,
        academicYear: academicYear || existingStudent.academicYear,
        registerYear: registerYear
          ? parseInt(registerYear)
          : existingStudent.registerYear,
        semester: semester || existingStudent.semester,
        is_active: true,
      },
    })

    // Update the student account with the payment amount
    await prisma.studentAccount.create({
      data: {
        studentId: updatedStudent.studentId,
        academicYear: updatedStudent.academicYear,
        semester: updatedStudent.semester,
        tuitionFee: department.price,
        discount: 0,
        paidAmount: 0,
        totalDue: department.price,
        status: "pending",
      },
    })

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    })
  } catch (error) {
    console.error("Error updating student:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

/**
 * Delete student
 * @route DELETE /api/students/:id
 * @access Private (Admin only)
 */
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id },
    })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Delete student
    // First delete related payments
    await prisma.payment.deleteMany({
      where: { studentId: student.studentId },
    })

    // Then delete the student
    await prisma.student.delete({
      where: { id },
    })

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting student:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

/**
 * Get students by department
 * @route GET /api/students/department/:departmentId
 * @access Private (Admin, Admission)
 */
const getStudentsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    })

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    const students = await prisma.student.findMany({
      where: { departmentId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
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

    res
      .status(200)
      .json({ success: true, count: students.length, data: students })
  } catch (error) {
    console.error("Error fetching students by department:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

/**
 * Get students by faculty
 * @route GET /api/students/faculty/:facultyId
 * @access Private (Admin, Admission)
 */
const getStudentsByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params

    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    })

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      })
    }

    const students = await prisma.student.findMany({
      where: { facultyId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
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

    res
      .status(200)
      .json({ success: true, count: students.length, data: students })
  } catch (error) {
    console.error("Error fetching students by faculty:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

export {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByDepartment,
  getStudentsByFaculty,
}
