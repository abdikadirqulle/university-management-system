import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import userRoutes from "./routes/auth/userRoutes.js"
import courseRoutes from "./routes/course/courseRoutes.js"
import departmentRoutes from "./routes/department/departmentRoutes.js"
import facultyRoutes from "./routes/faculties/facultyRoutes.js"
import studentRoutes from "./routes/students/studentRoutes.js"
import dashboardRoutes from "./routes/dashboard/dashboardRoutes.js"
import paymentRoutes from "./routes/financial/paymentRoutes.js"
import studentAuthRoutes from "./routes/students/studentAuthRoutes.js"
import exportRoutes from "./routes/exports/exportRoutes.js"
import reportRoutes from "./routes/report/reportRoutes.js"
import studentTransactionRoutes from "./routes/exports/studentTransactionRoutes.js"
import academicCalendarRoutes from "./routes/academic/academicCalendarRoutes.js"
import financialReportRoutes from "./routes/report/financialReportRoutes.js"
import settingsRoutes from "./routes/settings/settingsRoutes.js"
import { connectDB } from "./config/db.js"

// Load environment variables
dotenv.config()

// Initialize Express
const app = express()
const PORT = process.env.PORT || 5000

// Connect to database
connectDB()

// Middleware
app.use(express.json())
app.use(cors())

// Routes
app.use("/api/users", userRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/departments", departmentRoutes)
app.use("/api/faculties", facultyRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/student-auth", studentAuthRoutes)
app.use("/api/export", exportRoutes)
app.use("/api/reports", reportRoutes)
// student transaction routes
app.use("/api/student-transactions", studentTransactionRoutes)
app.use("/api/academic-calendar", academicCalendarRoutes)
app.use("/api/financial-reports", financialReportRoutes)
app.use("/api/settings", settingsRoutes)

// Default route
app.get("/", (req, res) => {
  res.send("AqoonMaamul API is running")
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`)
  // Close server & exit process
  process.exit(1)
})
