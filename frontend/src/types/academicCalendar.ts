export enum EventType {
  SEMESTER_START = 'semesterStart',
  SEMESTER_END = 'semesterEnd',
  HOLIDAY = 'holiday',
  EXAM_PERIOD = 'examPeriod',
  REGISTRATION_PERIOD = 'registrationPeriod',
  PAYMENT_DEADLINE = 'paymentDeadline',
  OTHER = 'other'
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  eventType: EventType;
  semester: string;
  academicYear: string;
  affectedDepartments: string[];
  createdBy: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CalendarEventFormData {
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  eventType: EventType;
  semester: string;
  academicYear: string;
  affectedDepartments: string[];
}
