import React, { useState, useEffect } from "react";
import { ArrowRight, Download, PlusCircle, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";

import CalendarEventForm from "@/components/academic-calendar/CalendarEventForm";
import CalendarEventsList from "@/components/academic-calendar/CalendarEventsList";
import CalendarEventDetail from "@/components/academic-calendar/CalendarEventDetail";

import useAcademicCalendarStore from "@/store/useAcademicCalendarStore";
import { useDepartmentStore } from "@/store/useDepartmentStore";
import { useAuth } from "@/context/AuthContext";
import { AcademicCalendarEvent, EventType } from "@/types/academicCalendar";

import { toast } from "sonner";
import SemesterTransitionDialog from "@/components/academic-calendar/SemesterTransitionDialog";

const AcademicCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { departments, fetchDepartments } = useDepartmentStore();
  const {
    events,
    selectedEvent,
    loading,
    error,
    filters,
    setFilters,
    fetchEvents,
    fetchEventById,
    addEvent,
    editEvent,
    removeEvent,
    setSelectedEvent,
  } = useAcademicCalendarStore();

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterYear, setFilterYear] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [activeTab, setActiveTab] = useState("list");
  const [isSemesterTransitionOpen, setIsSemesterTransitionOpen] =
    useState(false);
  console.log(events);
  // Fetch data on component mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      fetchEvents(token);
      // fetchDepartments(token);
    }
  }, [user, fetchEvents, fetchDepartments]);

  // Filter events for calendar view
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  // Handle form submission for creating/editing events
  const handleFormSubmit = async (data: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      if (isEditMode && selectedEvent) {
        await editEvent(selectedEvent.id, data, token);
        toast.success("Calendar event updated successfully");
      } else {
        // Add createdBy field with current user's ID
        await addEvent({ ...data, createdBy: user?.id || "" }, token);
        toast.success("Calendar event created successfully");
      }
      setIsFormOpen(false);
      setIsEditMode(false);
    } catch (error) {
      toast.error("Failed to save calendar event");
    }
  };

  // Filter events
  const filteredEvents = events.filter((event) => {
    return (
      (filterYear === "all" || event.academicYear === filterYear) &&
      (filterSemester === "all" || event.semester === filterSemester) &&
      (filterType === "all" || event.eventType === filterType)
    );
  });

  // Handle event deletion
  const handleDeleteEvent = async (eventId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      await removeEvent(eventId, token);
      toast.success("Calendar event deleted successfully");
    } catch (error) {
      toast.error("Failed to delete calendar event");
    }
  };

  // Open form for creating a new event
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  // Open form for editing an existing event
  const handleEditEvent = (event: AcademicCalendarEvent) => {
    setSelectedEvent(event);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  // Open dialog to view event details
  const handleViewEvent = (event: AcademicCalendarEvent) => {
    setSelectedEvent(event);
    setIsViewOpen(true);
  };

  const handleRefresh = () => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchEvents(token);
    }
    // filters.academicYear = "all";
    // filters.semester = "all";
    // // filters.eventType = ;
    // filters.isActive = true;
  };
  // Handle filter changes
  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters({ [key]: key === "isActive" ? value === "true" : value });

    const token = localStorage.getItem("token");
    if (token) {
      fetchEvents(token);
    }
  };

  // Generate academic year options
  const currentYear = new Date().getFullYear();
  const academicYearOptions = [
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
  ];

  return (
    <div>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Academic Calendar</h1>
          <Button onClick={handleAddEvent}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="flex justify-between ">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>
            {/* <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button> */}

            <Button
              variant="outline"
              className="flex items-center gap-2 bg-blue-500 text-white"
              onClick={() => setIsSemesterTransitionOpen(true)}
            >
              <ArrowRight className="h-4 w-4" />
              Semester Transition
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={filters.academicYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.semester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {Array.from({ length: 2 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Semester {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.eventType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={EventType.SEMESTER_START}>
                  Semester Start
                </SelectItem>
                <SelectItem value={EventType.SEMESTER_END}>
                  Semester End
                </SelectItem>
                <SelectItem value={EventType.HOLIDAY}>Holiday</SelectItem>
                <SelectItem value={EventType.EXAM_PERIOD}>
                  Exam Period
                </SelectItem>
                <SelectItem value={EventType.REGISTRATION_PERIOD}>
                  Registration
                </SelectItem>
                <SelectItem value={EventType.PAYMENT_DEADLINE}>
                  Payment Deadline
                </SelectItem>
                <SelectItem value={EventType.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={
                filters.isActive !== undefined
                  ? filters.isActive.toString()
                  : ""
              }
              onValueChange={(value) => handleFilterChange("isActive", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="secondary" onClick={handleRefresh}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="text-center py-8">Loading events...</div>
                ) : (
                  <CalendarEventsList
                    events={filteredEvents}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onView={handleViewEvent}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-4">
                      Events for{" "}
                      {selectedDate
                        ? selectedDate.toDateString()
                        : "Selected Date"}
                    </h3>
                    {selectedDate && (
                      <div className="space-y-4">
                        {getEventsForDate(selectedDate).length === 0 ? (
                          <p className="text-muted-foreground">
                            No events scheduled for this date
                          </p>
                        ) : (
                          getEventsForDate(selectedDate).map((event) => (
                            <div
                              key={event.id}
                              className="p-4 border rounded-md cursor-pointer hover:bg-gray-50"
                              onClick={() => handleViewEvent(event)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{event.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Semester {event.semester} |{" "}
                                    {event.academicYear}
                                  </p>
                                </div>
                                {event.eventType === EventType.SEMESTER_END && (
                                  <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                    Semester End
                                  </div>
                                )}
                                {event.eventType ===
                                  EventType.SEMESTER_START && (
                                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                    Semester Start
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Event Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Event" : "Create New Event"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update the details of this academic calendar event."
                  : "Add a new event to the academic calendar."}
              </DialogDescription>
            </DialogHeader>
            <CalendarEventForm
              event={isEditMode ? selectedEvent || undefined : undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              isLoading={loading}
            />
          </DialogContent>
        </Dialog>

        {/* View Event Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <CalendarEventDetail
                event={selectedEvent}
                departments={departments}
              />
            )}
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewOpen(false);
                  if (selectedEvent) {
                    handleEditEvent(selectedEvent);
                  }
                }}
              >
                Edit
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <SemesterTransitionDialog
          open={isSemesterTransitionOpen}
          onClose={() => setIsSemesterTransitionOpen(false)}
        />
      </div>
    </div>
  );
};

export default AcademicCalendarPage;
