import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Calendar as CalendarIcon,
  Filter,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

// Define event types for the calendar
type EventType = "academic" | "exam" | "holiday" | "registration";

// Define the CalendarEvent interface
interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  type: EventType;
  description: string;
  academicYear: string;
  semester: string;
}

// Sample data
const initialEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Fall Semester Begins",
    startDate: new Date(2023, 8, 1), // September 1, 2023
    endDate: new Date(2023, 8, 1),
    type: "academic",
    description: "Start of the Fall semester classes",
    academicYear: "2023-2024",
    semester: "semester one",
  },
  {
    id: "2",
    title: "Fall Break",
    startDate: new Date(2023, 9, 15), // October 15, 2023
    endDate: new Date(2023, 9, 19),
    type: "holiday",
    description: "Fall break for all students and faculty",
    academicYear: "2023-2024",
    semester: "semester one",
  },
  {
    id: "3",
    title: "Registration for Spring Semester",
    startDate: new Date(2023, 10, 1), // November 1, 2023
    endDate: new Date(2023, 10, 15),
    type: "registration",
    description: "Registration period for Spring semester",
    academicYear: "2023-2024",
    semester: "semester two",
  },
  {
    id: "4",
    title: "Final Examinations",
    startDate: new Date(2023, 11, 10), // December 10, 2023
    endDate: new Date(2023, 11, 17),
    type: "exam",
    description: "Fall semester final examination period",
    academicYear: "2023-2024",
    semester: "semester one",
  },
  {
    id: "5",
    title: "Spring Semester Begins",
    startDate: new Date(2024, 0, 15), // January 15, 2024
    endDate: new Date(2024, 0, 15),
    type: "academic",
    description: "Start of the Spring semester classes",
    academicYear: "2023-2024",
    semester: "semester two",
  },
];

// Formatter for table dates
const formatDate = (date: Date) => {
  return format(date, "MMM d, yyyy");
};

// Define form schema for calendar events
const eventFormSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  type: z.enum(["academic", "exam", "holiday", "registration"]),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters" }),
  academicYear: z.string().min(2, { message: "Academic year is required" }),
  semester: z.string().min(2, { message: "Semester is required" }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isOpen, setIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [filterYear, setFilterYear] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [date, setDate] = useState<Date>(new Date());

  // Setup form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      startDate: new Date(),
      endDate: new Date(),
      type: "academic",
      description: "",
      academicYear: "2023-2024",
      semester: "semester one",
    },
  });

  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingEvent(null);
    }
    setIsOpen(open);
  };

  // Handle form submission
  const onSubmit = (data: EventFormValues) => {
    if (editingEvent) {
      // Update existing event
      const updatedEvents = events.map((event) =>
        event.id === editingEvent.id ? { ...event, ...data } : event,
      );
      setEvents(updatedEvents);
    } else {
      // Add new event
      const newEvent: CalendarEvent = {
        id: String(Date.now()),
        ...data,
      };
      setEvents([...events, newEvent]);
    }
    handleDialogOpenChange(false);
  };

  // Handle edit event
  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    form.reset({
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      type: event.type,
      description: event.description,
      academicYear: event.academicYear,
      semester: event.semester,
    });
    setIsOpen(true);
  };

  // Handle delete event
  const handleDelete = (id: string) => {
    const updatedEvents = events.filter((event) => event.id !== id);
    setEvents(updatedEvents);
  };

  // Filter events
  const filteredEvents = events.filter((event) => {
    return (
      (filterYear === "all" || event.academicYear === filterYear) &&
      (filterSemester === "all" || event.semester === filterSemester) &&
      (filterType === "all" || event.type === filterType)
    );
  });

  // Get event type badge class
  const getEventTypeClass = (type: EventType) => {
    switch (type) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "exam":
        return "bg-red-100 text-red-800";
      case "holiday":
        return "bg-green-100 text-green-800";
      case "registration":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Define columns
  const columns: ColumnDef<CalendarEvent>[] = [
    {
      accessorKey: "title",
      header: "Event",
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => {
        const event = row.original;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${getEventTypeClass(
              event.type,
            )}`}
          >
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => formatDate(row.original.endDate),
    },
    {
      accessorKey: "academicYear",
      header: "Academic Year",
    },
    {
      accessorKey: "semester",
      header: "Semester",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(event)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(event.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];

  // Helper to get event date class for the calendar
  const getDayClass = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    for (const event of events) {
      // Check if the day falls between startDate and endDate
      const eventStart = format(event.startDate, "yyyy-MM-dd");
      const eventEnd = format(event.endDate, "yyyy-MM-dd");

      if (dayStr >= eventStart && dayStr <= eventEnd) {
        switch (event.type) {
          case "academic":
            return "bg-blue-100 text-blue-800 hover:bg-blue-200";
          case "exam":
            return "bg-red-100 text-red-800 hover:bg-red-200";
          case "holiday":
            return "bg-green-100 text-green-800 hover:bg-green-200";
          case "registration":
            return "bg-purple-100 text-purple-800 hover:bg-purple-200";
        }
      }
    }

    return "";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Calendar"
        description="Manage university academic calendar and events"
        action={{
          label: "Add Event",
          icon: Plus,
          onClick: () => setIsOpen(true),
        }}
      />

      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2022-2023">2022-2023</SelectItem>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="semester one">Semester One</SelectItem>
                <SelectItem value="semester two">Semester Two</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="registration">Registration</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Academic Calendar Events</CardTitle>
              <CardDescription>
                View and manage all academic calendar events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={filteredEvents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                Visual representation of academic events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    className="rounded-md border"
                    modifiersClassNames={{
                      selected: "bg-primary text-primary-foreground",
                    }}
                    modifiers={{
                      event: (date) => {
                        const dayStr = format(date, "yyyy-MM-dd");
                        return events.some((event) => {
                          const start = format(event.startDate, "yyyy-MM-dd");
                          const end = format(event.endDate, "yyyy-MM-dd");
                          return dayStr >= start && dayStr <= end;
                        });
                      },
                    }}
                    styles={{
                      day: (date) => {
                        return {
                          className: getDayClass(date),
                        };
                      },
                    }}
                  />

                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-medium">Event Types</h3>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                        <span className="text-xs">Academic</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                        <span className="text-xs">Exam</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                        <span className="text-xs">Holiday</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                        <span className="text-xs">Registration</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">
                    Events for {format(date, "MMMM d, yyyy")}
                  </h3>

                  <div className="space-y-4">
                    {events
                      .filter((event) => {
                        const selectedDate = format(date, "yyyy-MM-dd");
                        const start = format(event.startDate, "yyyy-MM-dd");
                        const end = format(event.endDate, "yyyy-MM-dd");
                        return selectedDate >= start && selectedDate <= end;
                      })
                      .map((event) => (
                        <Card
                          key={event.id}
                          className="p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>
                                  {formatDate(event.startDate)} -{" "}
                                  {formatDate(event.endDate)}
                                </span>
                                <span>•</span>
                                <span>{event.academicYear}</span>
                                <span>•</span>
                                <span>{event.semester}</span>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getEventTypeClass(
                                event.type,
                              )}`}
                            >
                              {event.type.charAt(0).toUpperCase() +
                                event.type.slice(1)}
                            </span>
                          </div>
                        </Card>
                      ))}

                    {events.filter((event) => {
                      const selectedDate = format(date, "yyyy-MM-dd");
                      const start = format(event.startDate, "yyyy-MM-dd");
                      const end = format(event.endDate, "yyyy-MM-dd");
                      return selectedDate >= start && selectedDate <= end;
                    }).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No events for this day
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Add New Event"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent
                ? "Update event information in the form below."
                : "Fill in the details to create a new calendar event."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
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
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
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
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
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

              <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="2022-2023">2022-2023</SelectItem>
                          <SelectItem value="2023-2024">2023-2024</SelectItem>
                          <SelectItem value="2024-2025">2024-2025</SelectItem>
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
                          <SelectItem value="semester one">
                            Semester One
                          </SelectItem>
                          <SelectItem value="semester two">
                            Semester Two
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
                name="type"
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
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="registration">
                          Registration
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingEvent ? "Update Event" : "Add Event"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
