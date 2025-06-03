import axios from 'axios';
import { AcademicCalendarEvent, CalendarEventFormData } from '@/types/academicCalendar';
import { api } from './api';

const API_ENDPOINT = `/academic-calendar`;

/**
 * Create a new academic calendar event
 * @param eventData The event data to create
 * @param token Authentication token
 */
export const createCalendarEvent = async (
  eventData: CalendarEventFormData,
  token: string
): Promise<AcademicCalendarEvent> => {
  try {
    const response = await api.post(API_ENDPOINT, eventData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

/**
 * Get all academic calendar events with optional filters
 * @param filters Optional filters for academic year, semester, event type, etc.
 * @param token Authentication token
 */
export const getCalendarEvents = async (
  filters?: {
    academicYear?: string;
    semester?: string;
    eventType?: string;
    isActive?: boolean;
  },
  token?: string
): Promise<AcademicCalendarEvent[]> => {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await api.get(API_ENDPOINT, {
      headers,
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

/**
 * Get a specific academic calendar event by ID
 * @param id The event ID
 * @param token Authentication token
 */
export const getCalendarEventById = async (
  id: string,
  token: string
): Promise<AcademicCalendarEvent> => {
  try {
    const response = await api.get(`${API_ENDPOINT}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    throw error;
  }
};

/**
 * Update an existing academic calendar event
 * @param id The event ID to update
 * @param eventData The updated event data
 * @param token Authentication token
 */
export const updateCalendarEvent = async (
  id: string,
  eventData: Partial<CalendarEventFormData>,
  token: string
): Promise<AcademicCalendarEvent> => {
  try {
    const response = await api.put(`${API_ENDPOINT}/${id}`, eventData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

/**
 * Delete an academic calendar event
 * @param id The event ID to delete
 * @param token Authentication token
 */
export const deleteCalendarEvent = async (
  id: string,
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`${API_ENDPOINT}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
};
