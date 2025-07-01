import { prisma } from "../../config/db.js"

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private/Admin
 */
const createCourse = async (req, res) => {
  const {
    academicYear,
    code,
    title,
    departmentId,
    credits,
    semester,
    instructor,
  } = req.body

  try {
    // Check if course with the same code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code },
    })

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course with this code already exists",
      })
    }

    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    })

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    // Create the course
    const newCourse = await prisma.course.create({
      data: {
        academicYear,
        code,
        title,
        departmentId,
        credits: parseInt(credits),
        semester,
        instructor,
      },
    })

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    })
  } catch (error) {
    console.error("Create course error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during course creation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        department: {
          select: {
            name: true,
            faculty: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })
    res.status(200).json({
      success: true,
      count: courses.length,

      data: courses,
    })
  } catch (error) {
    console.error("Get all courses error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * @desc    Get course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
const getCourseById = async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        department: {
          select: {
            name: true,
            faculty: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error("Get course by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private/Admin
 */
const updateCourse = async (req, res) => {
  const {
    academicYear,
    code,
    title,
    departmentId,
    credits,
    semester,
    instructor,
  } = req.body

  try {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
    })

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // If code is being changed, check if the new code already exists
    if (code && code !== course.code) {
      const existingCourse = await prisma.course.findUnique({
        where: { code },
      })

      if (existingCourse && existingCourse.id !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: "Course with this code already exists",
        })
      }
    }

    // If departmentId is provided, check if department exists
    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      })

      if (!department) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        })
      }
    }

    // Update the course
    const updatedCourse = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        academicYear: academicYear || course.academicYear,
        code: code || course.code,
        title: title || course.title,
        departmentId: departmentId || course.departmentId,
        credits: credits ? parseInt(credits) : course.credits,
        semester: semester || course.semester,
        instructor: instructor || course.instructor,
      },
    })

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error("Update course error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during course update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private/Admin
 */
const deleteCourse = async (req, res) => {
  try {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
    })

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Delete the course
    await prisma.course.delete({
      where: { id: req.params.id },
    })

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error("Delete course error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during course deletion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

export {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
}
