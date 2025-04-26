import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../config/db.js"

// Register user
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    // Create profile based on role
    if (role === "student") {
      const {
        studentId,
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

      if (!studentId || !fullName || !facultyId || !departmentId) {
        return res.status(400).json({
          success: false,
          message: "Required student details are missing",
        })
      }

      await prisma.student.create({
        data: {
          userId: newUser.id,
          studentId,
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
        },
      })
    } else if (
      role === "admin" ||
      role === "financial" ||
      role === "admission"
    ) {
      // For admin, financial and admission roles, no additional profile needed
      // The role is already stored in the User model
      return
    }

    // Generate JWT token
    const token = generateToken(newUser.id)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        students: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Generate JWT token
    const token = generateToken(user.id)

    // Extract role-specific data
    let roleData = null
    if (user.role === "student" && user.students.length > 0) {
      const student = user.students[0]
      roleData = {
        studentId: student.studentId,
        faculty: student.faculty?.name,
        department: student.department?.name,
        semester: student.semester,
        academicYear: student.academicYear,
      }
    } else if (user.role === "admin") {
      roleData = {
        // Admin specific data can be added here if needed
      }
    } else if (user.role === "financial") {
      roleData = {
        // Financial role specific data can be added here
      }
    } else if (user.role === "admission") {
      roleData = {
        // Admission role specific data can be added here
      }
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...roleData,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error getting user data",
    })
  }
}

// Update user
const updateUser = async (req, res) => {
  const { name, email, password } = req.body

  try {
    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (password) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(password, salt)
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error updating user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error getting users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get user by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Server error getting user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    await prisma.user.delete({
      where: { id: req.params.id },
    })

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error deleting user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

export {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
}
