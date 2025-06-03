import express from 'express';
const router = express.Router();
import { authenticateUser } from '../middleware/authMiddleware.js';
import {
  createCalendarEvent,
  getAllCalendarEvents,
  getCalendarEventById,
  updateCalendarEvent,
  deleteCalendarEvent
} from '../controllers/academicCalendarController.js';

// All routes require authentication
router.use(authenticateUser);

// Create a new academic calendar event (admin only)
router.post('/', createCalendarEvent);

// Get all calendar events
router.get('/', getAllCalendarEvents);

// Get a specific calendar event by ID
router.get('/:id', getCalendarEventById);

// Update a calendar event (admin only)
router.put('/:id', updateCalendarEvent);

// Delete a calendar event (admin only)
router.delete('/:id', deleteCalendarEvent);

export default router;
