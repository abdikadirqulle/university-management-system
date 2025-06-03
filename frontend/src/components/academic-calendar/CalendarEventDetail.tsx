import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AcademicCalendarEvent, EventType } from '@/types/academicCalendar';

interface CalendarEventDetailProps {
  event: AcademicCalendarEvent;
  departments: { id: string; name: string }[];
}

const CalendarEventDetail: React.FC<CalendarEventDetailProps> = ({ 
  event, 
  departments 
}) => {
  // Function to get badge color based on event type
  const getEventTypeBadge = (eventType: EventType) => {
    switch (eventType) {
      case EventType.SEMESTER_START:
        return <Badge className="bg-green-500">Semester Start</Badge>;
      case EventType.SEMESTER_END:
        return <Badge className="bg-red-500">Semester End</Badge>;
      case EventType.HOLIDAY:
        return <Badge className="bg-blue-500">Holiday</Badge>;
      case EventType.EXAM_PERIOD:
        return <Badge className="bg-yellow-500">Exam Period</Badge>;
      case EventType.REGISTRATION_PERIOD:
        return <Badge className="bg-purple-500">Registration</Badge>;
      case EventType.PAYMENT_DEADLINE:
        return <Badge className="bg-orange-500">Payment Deadline</Badge>;
      default:
        return <Badge>Other</Badge>;
    }
  };

  // Get department names from IDs
  const getAffectedDepartmentNames = () => {
    return event.affectedDepartments
      .map(id => departments.find(dept => dept.id === id)?.name || 'Unknown')
      .join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{event.title}</CardTitle>
          <div className="flex items-center gap-2">
            {getEventTypeBadge(event.eventType as EventType)}
            {event.isActive ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Inactive
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {event.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1">{event.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
            <p className="mt-1">{format(new Date(event.startDate), 'MMMM dd, yyyy')}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">End Date</h3>
            <p className="mt-1">{format(new Date(event.endDate), 'MMMM dd, yyyy')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Semester</h3>
            <p className="mt-1">Semester {event.semester}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Academic Year</h3>
            <p className="mt-1">{event.academicYear}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Affected Departments</h3>
          <p className="mt-1">{getAffectedDepartmentNames()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created At</h3>
            <p className="mt-1">{format(new Date(event.createdAt), 'MMMM dd, yyyy')}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <p className="mt-1">{format(new Date(event.updatedAt), 'MMMM dd, yyyy')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarEventDetail;
