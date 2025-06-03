import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Create a new academic calendar event
 * @route POST /api/academic-calendar
 */
const createCalendarEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      eventType,
      semester,
      academicYear,
      affectedDepartments,
      createdBy
    } = req.body;

    // Validate required fields
    if (!title || !startDate || !endDate || !eventType || !semester || !academicYear || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create the calendar event
    const calendarEvent = await prisma.academicCalendar.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        eventType,
        semester,
        academicYear,
        affectedDepartments: affectedDepartments || [],
        createdBy,
        isActive: true
      }
    });

    // If this is a semester end event, trigger the semester transition process
    if (eventType === 'semesterEnd') {
      await handleSemesterTransition(semester, academicYear, affectedDepartments);
    }

    res.status(201).json(calendarEvent);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ message: 'Failed to create calendar event', error: error.message });
  }
};

/**
 * Get all academic calendar events
 * @route GET /api/academic-calendar
 */
const getAllCalendarEvents = async (req, res) => {
  try {
    const { academicYear, semester, eventType, isActive } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    if (eventType) filter.eventType = eventType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const calendarEvents = await prisma.academicCalendar.findMany({
      where: filter,
      orderBy: {
        startDate: 'asc'
      }
    });

    res.status(200).json(calendarEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ message: 'Failed to fetch calendar events', error: error.message });
  }
};

/**
 * Get a specific academic calendar event by ID
 * @route GET /api/academic-calendar/:id
 */
const getCalendarEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const calendarEvent = await prisma.academicCalendar.findUnique({
      where: { id }
    });

    if (!calendarEvent) {
      return res.status(404).json({ message: 'Calendar event not found' });
    }

    res.status(200).json(calendarEvent);
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    res.status(500).json({ message: 'Failed to fetch calendar event', error: error.message });
  }
};

/**
 * Update an academic calendar event
 * @route PUT /api/academic-calendar/:id
 */
const updateCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startDate,
      endDate,
      eventType,
      semester,
      academicYear,
      affectedDepartments,
      isActive
    } = req.body;

    // Check if the event exists
    const existingEvent = await prisma.academicCalendar.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Calendar event not found' });
    }

    // Update the calendar event
    const updatedEvent = await prisma.academicCalendar.update({
      where: { id },
      data: {
        title: title || existingEvent.title,
        description: description !== undefined ? description : existingEvent.description,
        startDate: startDate ? new Date(startDate) : existingEvent.startDate,
        endDate: endDate ? new Date(endDate) : existingEvent.endDate,
        eventType: eventType || existingEvent.eventType,
        semester: semester || existingEvent.semester,
        academicYear: academicYear || existingEvent.academicYear,
        affectedDepartments: affectedDepartments || existingEvent.affectedDepartments,
        isActive: isActive !== undefined ? isActive : existingEvent.isActive
      }
    });

    // If this is a semester end event and it was just activated, trigger the semester transition
    if (updatedEvent.eventType === 'semesterEnd' && 
        updatedEvent.isActive && 
        (!existingEvent.isActive || existingEvent.eventType !== 'semesterEnd')) {
      await handleSemesterTransition(updatedEvent.semester, updatedEvent.academicYear, updatedEvent.affectedDepartments);
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ message: 'Failed to update calendar event', error: error.message });
  }
};

/**
 * Delete an academic calendar event
 * @route DELETE /api/academic-calendar/:id
 */
const deleteCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the event exists
    const existingEvent = await prisma.academicCalendar.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Calendar event not found' });
    }

    // Delete the calendar event
    await prisma.academicCalendar.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ message: 'Failed to delete calendar event', error: error.message });
  }
};

/**
 * Handle semester transition logic when a semester ends
 * This function updates student semesters and tuition fees
 */
const handleSemesterTransition = async (semester, academicYear, affectedDepartments) => {
  try {
    // Get all active students in the affected departments
    const students = await prisma.student.findMany({
      where: {
        is_active: true,
        departmentId: {
          in: affectedDepartments
        },
        semester: semester
      },
      include: {
        department: true
      }
    });

    // Process each student
    for (const student of students) {
      // Calculate next semester
      const currentSemester = parseInt(student.semester);
      let nextSemester = currentSemester + 1;
      
      // Get the total number of semesters for this department
      // This would need to be configured somewhere in your system
      // For now, let's assume 8 semesters (4 years) is standard
      const totalSemesters = 8; 
      
      if (nextSemester > totalSemesters) {
        // Student has completed all semesters, mark as inactive (graduated)
        await prisma.student.update({
          where: { id: student.id },
          data: {
            is_active: false,
            semester: "Graduated"
          }
        });
      } else {
        // Update to next semester
        await prisma.student.update({
          where: { id: student.id },
          data: {
            semester: nextSemester.toString()
          }
        });
        
        // Create new tuition fee record for next semester
        const tuitionFee = student.department.price || 0;
        
        await prisma.studentAccount.create({
          data: {
            studentId: student.studentId,
            academicYear: academicYear,
            semester: nextSemester.toString(),
            tuitionFee: tuitionFee,
            totalDue: tuitionFee,
            status: 'pending'
          }
        });
      }
    }
    
    console.log(`Processed semester transition for ${students.length} students`);
    return true;
  } catch (error) {
    console.error('Error handling semester transition:', error);
    throw error;
  }
};

export {
  createCalendarEvent,
  getAllCalendarEvents,
  getCalendarEventById,
  updateCalendarEvent,
  deleteCalendarEvent
};
