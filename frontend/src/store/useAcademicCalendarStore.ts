import { create } from 'zustand';
import { 
  AcademicCalendarEvent, 
  CalendarEventFormData, 
  EventType 
} from '@/types/academicCalendar';
import { 
  createCalendarEvent, 
  getCalendarEvents, 
  getCalendarEventById, 
  updateCalendarEvent, 
  deleteCalendarEvent 
} from '@/services/academicCalendarService';

interface AcademicCalendarState {
  events: AcademicCalendarEvent[];
  selectedEvent: AcademicCalendarEvent | null;
  loading: boolean;
  error: string | null;
  
  // Filters
  filters: {
    academicYear?: string;
    semester?: string;
    eventType?: EventType;
    isActive?: boolean;
  };
  
  // Actions
  setFilters: (filters: Partial<AcademicCalendarState['filters']>) => void;
  fetchEvents: (token: string) => Promise<void>;
  fetchEventById: (id: string, token: string) => Promise<void>;
  addEvent: (eventData: CalendarEventFormData, token: string) => Promise<void>;
  editEvent: (id: string, eventData: Partial<CalendarEventFormData>, token: string) => Promise<void>;
  removeEvent: (id: string, token: string) => Promise<void>;
  setSelectedEvent: (event: AcademicCalendarEvent | null) => void;
  clearError: () => void;
}

const useAcademicCalendarStore = create<AcademicCalendarState>((set, get) => ({
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  filters: {
    isActive: true,
  },
  
  setFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },
  
  fetchEvents: async (token) => {
    set({ loading: true, error: null });
    try {
      const filters = get().filters;
      const events = await getCalendarEvents(filters, token);
      set({ events, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch calendar events', 
        loading: false 
      });
    }
  },
  
  fetchEventById: async (id, token) => {
    set({ loading: true, error: null });
    try {
      const event = await getCalendarEventById(id, token);
      set({ selectedEvent: event, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch calendar event', 
        loading: false 
      });
    }
  },
  
  addEvent: async (eventData, token) => {
    set({ loading: true, error: null });
    try {
      const newEvent = await createCalendarEvent(eventData, token);
      set((state) => ({ 
        events: [...state.events, newEvent], 
        loading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create calendar event', 
        loading: false 
      });
    }
  },
  
  editEvent: async (id, eventData, token) => {
    set({ loading: true, error: null });
    try {
      const updatedEvent = await updateCalendarEvent(id, eventData, token);
      set((state) => ({
        events: state.events.map((event) => 
          event.id === id ? updatedEvent : event
        ),
        selectedEvent: updatedEvent,
        loading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update calendar event', 
        loading: false 
      });
    }
  },
  
  removeEvent: async (id, token) => {
    set({ loading: true, error: null });
    try {
      await deleteCalendarEvent(id, token);
      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
        selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
        loading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete calendar event', 
        loading: false 
      });
    }
  },
  
  setSelectedEvent: (event) => {
    set({ selectedEvent: event });
  },
  
  clearError: () => {
    set({ error: null });
  },
}));

export default useAcademicCalendarStore;
