import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { AcademicCalendarEvent, EventType } from '@/types/academicCalendar';
import { useDepartmentStore } from '@/store/useDepartmentStore';

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().optional(),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }).refine(date => date instanceof Date, {
    message: 'End date is required',
  }),
  eventType: z.nativeEnum(EventType, {
    required_error: 'Event type is required',
  }),
  semester: z.string({
    required_error: 'Semester is required',
  }),
  academicYear: z.string({
    required_error: 'Academic year is required',
  }),
  affectedDepartments: z.array(z.string()).min(1, {
    message: 'Select at least one department',
  }),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface CalendarEventFormProps {
  event?: AcademicCalendarEvent;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const CalendarEventForm: React.FC<CalendarEventFormProps> = ({
  event,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const { departments, fetchDepartments } = useDepartmentStore();
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  // Initialize the form with default values or existing event data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description || '',
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          eventType: event.eventType as EventType,
          semester: event.semester,
          academicYear: event.academicYear,
          affectedDepartments: event.affectedDepartments,
          isActive: event.isActive,
        }
      : {
          title: '',
          description: '',
          startDate: new Date(),
          endDate: new Date(),
          eventType: EventType.OTHER,
          semester: '',
          academicYear: new Date().getFullYear().toString(),
          affectedDepartments: [],
          isActive: true,
        },
  });

  // Fetch departments when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchDepartments(token);
    }
  }, [fetchDepartments]);

  // Update selected departments when event changes
  useEffect(() => {
    if (event) {
      setSelectedDepartments(event.affectedDepartments);
    }
  }, [event]);

  // Handle department selection
  const handleDepartmentToggle = (departmentId: string) => {
    setSelectedDepartments((prev) => {
      if (prev.includes(departmentId)) {
        return prev.filter((id) => id !== departmentId);
      } else {
        return [...prev, departmentId];
      }
    });

    // Update form value
    const currentDepts = form.getValues('affectedDepartments');
    if (currentDepts.includes(departmentId)) {
      form.setValue(
        'affectedDepartments',
        currentDepts.filter((id) => id !== departmentId)
      );
    } else {
      form.setValue('affectedDepartments', [...currentDepts, departmentId]);
    }
  };

  // Generate semester options (1-8)
  const semesterOptions = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

  // Generate academic year options (current year - 1, current year, current year + 1)
  const currentYear = new Date().getFullYear();
  const academicYearOptions = [
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter event description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="eventType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={EventType.SEMESTER_START}>
                      Semester Start
                    </SelectItem>
                    <SelectItem value={EventType.SEMESTER_END}>
                      Semester End
                    </SelectItem>
                    <SelectItem value={EventType.HOLIDAY}>
                      Holiday
                    </SelectItem>
                    <SelectItem value={EventType.EXAM_PERIOD}>
                      Exam Period
                    </SelectItem>
                    <SelectItem value={EventType.REGISTRATION_PERIOD}>
                      Registration Period
                    </SelectItem>
                    <SelectItem value={EventType.PAYMENT_DEADLINE}>
                      Payment Deadline
                    </SelectItem>
                    <SelectItem value={EventType.OTHER}>
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="semester 1">
                      Semester 1
                    </SelectItem>
                    <SelectItem value="semester 2">
                      Semester 2
                      </SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="academicYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Academic Year</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {academicYearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="affectedDepartments"
          render={() => (
            <FormItem>
              <FormLabel>Affected Departments</FormLabel>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                {departments.map((department) => (
                  <div key={department.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={department.id}
                      checked={selectedDepartments.includes(department.id)}
                      onCheckedChange={() => handleDepartmentToggle(department.id)}
                    />
                    <label
                      htmlFor={department.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {department.name}
                    </label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {event && (
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Active Event</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Inactive events won't trigger any actions
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CalendarEventForm;
