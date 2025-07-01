import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../../config/db.js"
import { generateToken } from "../../utils/generateToken.js"
import nodemailer from "nodemailer"
import chalk from "chalk"

// Register user
const registerUser = async (req, res) => {
  const { name, username, email, password, role } = req.body

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this username",
      })
    }

    // Hash password
    // const salt = await bcrypt.genSalt(10)
    // const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        username,
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
        username: newUser.username,
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
  const { username, password } = req.body

  try {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This user is deactivated. Please contact the administrator.",
      })
    }

    // Verify password
    // const isPasswordValid = await bcrypt.compare(password, user.password)

    // if (!isPasswordValid) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid credentials",
    //   })
    // }

    // Generate JWT token
    const token = generateToken(user.id)

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
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
        username: true,
        email: true,
        role: true,
        isActive: true,
        password: true,
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
    if (password) updateData.password = password

    // Hash password if provided
    // if (password) {
    //   const salt = await bcrypt.genSalt(10)
    //   updateData.password = await bcrypt.hash(password, salt)
    // }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        password: true,
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

    console.log(`Attempting to update user with ID: ${id}`)
    console.log(chalk.green("Update data:"), {
      name,
      email,
      role,
      hasPassword: !!password,
    })

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      console.log(`User not found with ID: ${id}`)
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    console.log(`Found user: ${user.name} (${user.email})`)

    // Update user data
    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role

    // Hash password if provided
    if (password) {
      console.log("Updating password for user")
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(password, salt)
    }

    console.log("Updating user with data:", {
      ...updateData,
      password: password ? "[REDACTED]" : undefined,
    })

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

    console.log(`Successfully updated user: ${updatedUser.name}`)

    res.status(200).json({
      success: true,
      message: password
        ? "User updated successfully with new password"
        : "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update user by ID error:", error)

    // Check for specific error types
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists",
      })
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

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
        username: true,
        email: true,
        role: true,
        password: true,
        isActive: true,
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
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
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

// Toggle user activation status (admin only)
const toggleUserActivation = async (req, res) => {
  try {
    const { id } = req.params

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

    // Toggle activation status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const status = updatedUser.isActive ? "activated" : "deactivated"

    res.status(200).json({
      success: true,
      message: `User ${status} successfully`,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Toggle user activation error:", error)
    res.status(500).json({
      success: false,
      message: "Server error toggling user activation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Request password reset
const requestPasswordReset = async (req, res) => {
  const { email } = req.body

  try {
    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "If a user with this email exists, they will receive reset instructions.",
      })
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, type: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    )

    // Store reset token and expiry in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      },
    })

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // accept self‑signed certs
        rejectUnauthorized: false,
      },
    })

    // Send reset email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    })

    console.log(chalk.green("Frontend URL: " + process.env.FRONTEND_URL))
    res.status(200).json({
      success: true,
      message:
        "If a user with this email exists, they will receive reset instructions.",
    })
  } catch (error) {
    console.error("Password reset request error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during password reset request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Reset password with token
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.type !== "password_reset") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      })
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    })
  } catch (error) {
    console.error("Password reset error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
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
  toggleUserActivation,
  requestPasswordReset,
  resetPassword,
}
