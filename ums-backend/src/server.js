import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import helmet from "helmet"
import morgan from "morgan"

const app = express()

// Middleware
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))

// Sample route
app.get("/", (req, res) => {
  res.send("University Management System API is running...")
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
