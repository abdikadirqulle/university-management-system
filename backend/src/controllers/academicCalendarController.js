import { PrismaClient } from "@prisma/client"
import chalk from "chalk"
const prisma = new PrismaClient()

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
      createdBy,
    } = req.body

    // Validate required fields
    if (
      !title ||
      !startDate ||
      !endDate ||
      !eventType ||
      !semester ||
      !academicYear ||
      !createdBy
    ) {
      return res.status(400).json({ message: "Missing required fields" })
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
        isActive: true,
      },
    })

    // If this is a semester end event, trigger the semester transition process
    if (eventType === "semesterEnd") {
      await handleSemesterTransition(
        semester,
        academicYear,
        affectedDepartments
      )
    }

    res.status(201).json(calendarEvent)
  } catch (error) {
    console.error("Error creating calendar event:", error)
    res.status(500).json({
      message: "Failed to create calendar event",
      error: error.message,
    })
  }
}

/**
 * Get all academic calendar events
 * @route GET /api/academic-calendar
 */
const getAllCalendarEvents = async (req, res) => {
  try {
    const { academicYear, semester, eventType, isActive } = req.query

    // Build filter object based on query parameters
    const filter = {}

    if (academicYear) filter.academicYear = academicYear
    if (semester) filter.semester = semester
    if (eventType) filter.eventType = eventType
    if (isActive !== undefined) filter.isActive = isActive === "true"

    const calendarEvents = await prisma.academicCalendar.findMany({
      where: filter,
      orderBy: {
        startDate: "asc",
      },
    })

    res.status(200).json(calendarEvents)
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    res.status(500).json({
      message: "Failed to fetch calendar events",
      error: error.message,
    })
  }
}

/**
 * Get a specific academic calendar event by ID
 * @route GET /api/academic-calendar/:id
 */
const getCalendarEventById = async (req, res) => {
  try {
    const { id } = req.params

    const calendarEvent = await prisma.academicCalendar.findUnique({
      where: { id },
    })

    if (!calendarEvent) {
      return res.status(404).json({ message: "Calendar event not found" })
    }

    res.status(200).json(calendarEvent)
  } catch (error) {
    console.error("Error fetching calendar event:", error)
    res
      .status(500)
      .json({ message: "Failed to fetch calendar event", error: error.message })
  }
}

/**
 * Update an academic calendar event
 * @route PUT /api/academic-calendar/:id
 */
const updateCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      description,
      startDate,
      endDate,
      eventType,
      semester,
      academicYear,
      affectedDepartments,
      isActive,
    } = req.body

    // Check if the event exists
    const existingEvent = await prisma.academicCalendar.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return res.status(404).json({ message: "Calendar event not found" })
    }

    // Update the calendar event
    const updatedEvent = await prisma.academicCalendar.update({
      where: { id },
      data: {
        title: title || existingEvent.title,
        description:
          description !== undefined ? description : existingEvent.description,
        startDate: startDate ? new Date(startDate) : existingEvent.startDate,
        endDate: endDate ? new Date(endDate) : existingEvent.endDate,
        eventType: eventType || existingEvent.eventType,
        semester: semester || existingEvent.semester,
        academicYear: academicYear || existingEvent.academicYear,
        affectedDepartments:
          affectedDepartments || existingEvent.affectedDepartments,
        isActive: isActive !== undefined ? isActive : existingEvent.isActive,
      },
    })

    // If this is a semester end event and it was just activated, trigger the semester transition
    if (
      updatedEvent.eventType === "semesterEnd" &&
      updatedEvent.isActive &&
      (!existingEvent.isActive || existingEvent.eventType !== "semesterEnd")
    ) {
      await handleSemesterTransition(
        updatedEvent.semester,
        updatedEvent.academicYear,
        updatedEvent.affectedDepartments
      )
    }

    res.status(200).json(updatedEvent)
  } catch (error) {
    console.error("Error updating calendar event:", error)
    res.status(500).json({
      message: "Failed to update calendar event",
      error: error.message,
    })
  }
}

/**
 * Delete an academic calendar event
 * @route DELETE /api/academic-calendar/:id
 */
const deleteCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params

    // Check if the event exists
    const existingEvent = await prisma.academicCalendar.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return res.status(404).json({ message: "Calendar event not found" })
    }

    // Delete the calendar event
    await prisma.academicCalendar.delete({
      where: { id },
    })

    res.status(200).json({ message: "Calendar event deleted successfully" })
  } catch (error) {
    console.error("Error deleting calendar event:", error)
    res.status(500).json({
      message: "Failed to delete calendar event",
      error: error.message,
    })
  }
}

const handleTransition = async (req, res) => {
  try {
    const { semester, academicYear, departmentIds } = req.body

    if (
      !semester ||
      !academicYear ||
      !departmentIds ||
      !Array.isArray(departmentIds)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: semester, academicYear, and departmentIds (array)",
      })
    }

    const semesterInt = Number(semester)

    await handleSemesterTransition(semesterInt, academicYear, departmentIds)

    res.status(200).json({
      success: true,
      message: `Semester transition completed for semester ${semester}, academic year ${academicYear}`,
    })
  } catch (error) {
    console.error("Error triggering semester transition:", error)
    res.status(500).json({
      success: false,
      message: "Failed to process semester transition",
      error: error.message,
    })
  }
}

/**
 * Handle semester transition logic when a semester ends
 * This function updates student semesters and tuition fees
 */
const handleSemesterTransition = async (
  semesterInt,
  academicYear,
  affectedDepartments
) => {
  try {
    // Get all active students in the affected departments
    const students = await prisma.student.findMany({
      where: {
        isActive: true,
        // status: "normal",
        departmentId: {
          in: affectedDepartments,
        },
        semester: semesterInt,
      },
      include: {
        department: true,
        studentAccount: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    console.log(`Found ${students.length} students for semester transition`)

    // Process each student
    for (const student of students) {
      // Calculate next semester
      const currentSemester = parseInt(student.semester)
      let nextSemester = currentSemester + 1

      // Get the department's current semester (from department record)
      const departmentSemester = student.department.semester
        ? parseInt(student.department.semester)
        : 8 // Default to 8 semesters if not specified

      // Get the current student account
      const currentAccount = student.studentAccount?.[0]

      // Calculate pending balance to forward
      const pendingAmount = currentAccount
        ? currentAccount.totalDue -
          (currentAccount.paidAmount || 0) -
          (currentAccount.discount || 0)
        : 0

      // Check if student will become an alumnus
      if (nextSemester > departmentSemester) {
        // Student has completed all semesters, mark as inactive (graduated/alumnus)
        await prisma.student.update({
          where: { id: student.id },
          data: {
            isActive: false,
            status: "Graduated",
          },
        })

        // Update student account status to graduated
        await prisma.studentAccount.update({
          where: { studentId: student.studentId },
          data: {
            status: "graduated",
            semester: Number(nextSemester),
            is_active: false,
          },
        })

        // Send notification to student about becoming an alumnus
        await sendAlumnusNotification(student)

        console.log(
          chalk.yellow.bold(
            `Student ${student.fullName} (${student.studentId}) has graduated`
          )
        )
      } else {
        // Update to next semester
        await prisma.student.update({
          where: { id: student.id },
          data: {
            semester: Number(nextSemester),
          },
        })

        // Calculate new tuition fee
        const tuitionFee = student.department.price || 0

        const scholarshipInt =
          currentAccount?.tuitionFee - currentAccount?.scholarship || 0

        console.log(chalk.yellow.bold(`scholarshipInt: ${scholarshipInt}`))

        // Create new student account for the next semester
        const updateStudentAccount = await prisma.studentAccount.update({
          where: { studentId: student.studentId },
          data: {
            academicYear: academicYear,
            semester: Number(nextSemester),
            tuitionFee: tuitionFee,
            forwarded: pendingAmount > 0 ? pendingAmount : 0, // Forward pending amount if positive
            totalDue: tuitionFee + (pendingAmount > 0 ? pendingAmount : 0), // Add forwarded amount to total due
            paidAmount: 0, // Reset paid amount for new semester
            paidType: currentAccount?.paidType || null, // Maintain the same payment type
            discount: 0, // Reset discount for new semester
            scholarship: scholarshipInt, // Maintain scholarship for new semester
            status: "normal", // Set status to normal for regular semester transition
          },
        })

        console.log("updateStudentAccount", updateStudentAccount)

        console.log(
          chalk.green(
            `Student ${student.fullName} (${student.studentId}) promoted to semester ${nextSemester} with ${pendingAmount > 0 ? pendingAmount : 0} forwarded`
          )
        )
      }
    }

    console.log(
      chalk.green.bold(
        `Completed semester transition for ${students.length} students`
      )
    )
    return true
  } catch (error) {
    console.error("Error handling semester transition:", error)
    throw error
  }
}

/**
 * Send notification to student about becoming an alumnus
 * This is a placeholder function - implement actual notification logic
 */
const sendAlumnusNotification = async (student) => {
  try {
    // Here you would implement your notification logic
    // For example, sending an email or SMS
    console.log(
      chalk.bgGreenBright.black.bold(
        `Notification sent to ${student.fullName} (${student.email}) about alumnus status`
      )
    )

    // For now, we'll just log the notification
    return true
  } catch (error) {
    console.error(
      chalk.red.bold(
        `Error sending alumnus notification to ${student.email}: ${error}`
      )
    )
    return false
  }
}

export {
  createCalendarEvent,
  getAllCalendarEvents,
  getCalendarEventById,
  updateCalendarEvent,
  deleteCalendarEvent,
  handleSemesterTransition,
  handleTransition,
}
