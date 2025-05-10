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
        password,
        role,
      },
    })

    // Create profile based on role
 

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
     
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check password
    // const isPasswordValid = await bcrypt.compare(password, user.password)

    // if (!isPasswordValid) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid credentials",
    //   })
    // }

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
  try {
    // Get user data from request body
    const { name, email, password } = req.body

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update user data
    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(password, salt)
    }

    // Update user in database
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

// Update user by ID (admin only)
const updateUserById = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, password, role } = req.body

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update user data
    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(password, salt)
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id },
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
    console.error("Update user by ID error:", error)
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

// Logout user
const logoutUser = async (req, res) => {
  try {
    // Get user ID from request object (set by auth middleware)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      })
    }

    // In a stateless JWT authentication system, we don't need to invalidate tokens on the server
    // since tokens are validated by signature and expiration time
    // However, we can implement a token blacklist or revocation mechanism if needed
    
    // For now, we'll just send a success response
    // The client will remove the token from local storage
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during logout",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUser,
  updateUserById,
  getAllUsers,
  getUserById,
  deleteUser,
}
