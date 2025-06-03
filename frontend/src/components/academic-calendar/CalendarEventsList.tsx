import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { AcademicCalendarEvent, EventType } from '@/types/academicCalendar';

interface CalendarEventsListProps {
  events: AcademicCalendarEvent[];
  onEdit: (event: AcademicCalendarEvent) => void;
  onDelete: (eventId: string) => void;
  onView: (event: AcademicCalendarEvent) => void;
}

const CalendarEventsList: React.FC<CalendarEventsListProps> = ({
  events,
  onEdit,
  onDelete,
  onView,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

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

  // Handle delete confirmation
  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      onDelete(eventToDelete);
      setEventToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                No calendar events found
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{getEventTypeBadge(event.eventType as EventType)}</TableCell>
                <TableCell>{format(new Date(event.startDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{format(new Date(event.endDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell>Semester {event.semester}</TableCell>
                <TableCell>{event.academicYear}</TableCell>
                <TableCell>
                  {event.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(event)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(event)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(event.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the calendar event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarEventsList;
