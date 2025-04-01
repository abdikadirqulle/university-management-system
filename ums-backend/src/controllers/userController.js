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
    if (role === "STUDENT") {
      const { studentId, department, yearOfStudy } = req.body

      if (!studentId || !department || !yearOfStudy) {
        return res.status(400).json({
          success: false,
          message: "Student details are required",
        })
      }

      await prisma.student.create({
        data: {
          userId: newUser.id,
          studentId,
          department,
          yearOfStudy: parseInt(yearOfStudy),
        },
      })
    } else if (role === "ADMIN") {
      const { adminRole } = req.body

      if (!adminRole) {
        return res.status(400).json({
          success: false,
          message: "Admin role is required",
        })
      }

      await prisma.admin.create({
        data: {
          userId: newUser.id,
          role: adminRole,
        },
      })
    } else if (role === "FACULTY") {
      const { department, position } = req.body

      if (!department || !position) {
        return res.status(400).json({
          success: false,
          message: "Faculty details are required",
        })
      }

      await prisma.faculty.create({
        data: {
          userId: newUser.id,
          department,
          position,
        },
      })
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
        student: true,
        admin: true,
        faculty: true,
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
    if (user.role === "STUDENT" && user.student) {
      roleData = {
        studentId: user.student.studentId,
        department: user.student.department,
        yearOfStudy: user.student.yearOfStudy,
      }
    } else if (
      (user.role === "ADMIN" || user.role === "SUPER_ADMIN") &&
      user.admin
    ) {
      roleData = {
        adminRole: user.admin.role,
      }
    } else if (user.role === "FACULTY" && user.faculty) {
      roleData = {
        department: user.faculty.department,
        position: user.faculty.position,
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
    // User is already attached to req by the auth middleware
    res.status(200).json({
      success: true,
      user: req.user,
    })
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error getting user data",
    })
  }
}

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

export { registerUser, loginUser, getCurrentUser }
