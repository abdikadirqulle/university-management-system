import jwt from "jsonwebtoken"
import { prisma } from "../config/db.js"

// Middleware to authenticate user and attach user to request
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user by id
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
   
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Invalid token",
      })
    }

    // Attach user to request object
    req.user = user
    next()
  } catch (error) {
    console.error("Authentication error:", error.message)

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not authorized",
      })
    }

    next()
  }
}

// Check if user is an admin with specific admin role
const authorizeAdmin = (...adminRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      })
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only",
      })
    }

    // If no specific admin roles are required
    if (adminRoles.length === 0) {
      return next()
    }

    // Check if user has one of the required admin roles
    if (!req.user.admin || !adminRoles.includes(req.user.admin.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient admin privileges",
      })
    }

    next()
  }
}

export { authenticateUser, authorize, authorizeAdmin }
