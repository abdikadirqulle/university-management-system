import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import userRoutes from "./routes/userRoutes.js"
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
// Add more routes as needed
// app.use('/api/courses', courseRoutes);
// app.use('/api/exams', examRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("University Management System API is running")
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
