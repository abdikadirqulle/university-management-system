import express from "express"

import chalk from "chalk"
import { authenticateUser } from "../../middleware/authMiddleware.js"
import {
  createCalendarEvent,
  getAllCalendarEvents,
  getCalendarEventById,
  updateCalendarEvent,
  deleteCalendarEvent,
  handleSemesterTransition,
  handleTransition,
} from "../../controllers/academic/academicCalendarController.js"

const router = express.Router()

// All routes require authentication
router.use(authenticateUser)

// Create a new academic calendar event (admin only)
router.post("/", createCalendarEvent)

// Get all calendar events
router.get("/", getAllCalendarEvents)

// Get a specific calendar event by ID
router.get("/:id", getCalendarEventById)

// Update a calendar event (admin only)
router.put("/:id", updateCalendarEvent)

// Delete a calendar event (admin only)
router.delete("/:id", deleteCalendarEvent)

// Manually trigger semester transition (admin only)
router.post("/transition", handleTransition)

export default router
