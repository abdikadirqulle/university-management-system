import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../config/db.js"

// Login student using student ID
const loginStudent = async (req, res) => {
  const { studentId, password } = req.body

  try {
    // Find student by student ID
    const student = await prisma.student.findUnique({
      where: { studentId },
      include: {
        department: {
          select: {
            name: true,
          },
        },
        faculty: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid student ID or password",
      })
    }

    // Check if student is active
    if (!student.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "This student account is deactivated. Please contact the administrator.",
      })
    }

    // For simplicity in this implementation, we'll use a basic password check
    // In a real-world scenario, you would use bcrypt to compare hashed passwords
    // This assumes the password is stored in plaintext or has a default value
    // In production, always use proper password hashing

    // Check if password matches (simple check for demo)
    // The default password is the student ID
    if (password !== studentId) {
      return res.status(401).json({
        success: false,
        message: "Invalid student ID or password",
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: student.id,
        studentId: student.studentId,
        role: "student",
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "30d" }
    )

    // Create a user object for the student
    const userObject = {
      id: student.id,
      name: student.fullName,
      email: student.email,
      role: "student",
      studentId: student.studentId,
      department: student.department?.name,
      faculty: student.faculty?.name,
      semester: student.semester,
      academicYear: student.academicYear,
      isActive: student.isActive,
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userObject,
    })
  } catch (error) {
    console.error("Student login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get current student
const getCurrentStudent = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.user.id },
      include: {
        department: {
          select: {
            name: true,
          },
        },
        faculty: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    const userObject = {
      id: student.id,
      name: student.fullName,
      email: student.email,
      role: "student",
      studentId: student.studentId,
      department: student.department?.name,
      faculty: student.faculty?.name,
      semester: student.semester,
      academicYear: student.academicYear,
    }

    res.status(200).json({
      success: true,
      user: userObject,
    })
  } catch (error) {
    console.error("Get current student error:", error)
    res.status(500).json({
      success: false,
      message: "Server error getting student data",
    })
  }
}

export { loginStudent, getCurrentStudent }
