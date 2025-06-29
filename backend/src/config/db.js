import { PrismaClient } from "@prisma/client"

// Create a singleton instance of Prisma Client
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
})

// Handle potential connection errors
// prisma.$on("query", (e) => {
//   console.log("Query: " + e.query)
//   console.log("Duration: " + e.duration + "ms")
// })

// Connect to the database
async function connectDB() {
  try {
    await prisma.$connect()
    console.log("🔌 Database connected successfully")
    return prisma
  } catch (error) {
    console.error("❌ Database connection error:", error)
    process.exit(1)
  }
}

// Function to disconnect from database
async function disconnectDB() {
  await prisma.$disconnect()
  console.log("Database disconnected")
}

export { prisma, connectDB, disconnectDB }
