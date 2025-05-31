import { prisma } from "../config/db.js"

/**
 * @desc    Create a new faculty
 * @route   POST /api/faculties
 * @access  Private/Admin
 */
const createFaculty = async (req, res) => {
  const { name, dean, establish } = req.body

  try {
    // Check if faculty with the same name already exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: { name },
    })

    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: "Faculty with this name already exists",
      })
    }

    // Create the faculty
    const newFaculty = await prisma.faculty.create({
      data: {
        name,
        dean,
        establish: parseInt(establish),
      },
    })

    res.status(201).json({
      success: true,
      message: "Faculty created successfully",
      data: newFaculty,
    })
  } catch (error) {
    console.error("Create faculty error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during faculty creation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * @desc    Get all faculties
 * @route   GET /api/faculties
 * @access  Public
 */
const getAllFaculties = async (req, res) => {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        departments: {
          select: {
            id: true,
            name: true,
            departmentHead: true,
          },
        },
      },
    })

    res.status(200).json({
      success: true,
      count: faculties.length,
      data: faculties,
    })
  } catch (error) {
    console.error("Get all faculties error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching faculties",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * @desc    Get faculty by ID
 * @route   GET /api/faculties/:id
 * @access  Public
 */
const getFacultyById = async (req, res) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: req.params.id },
      include: {
        departments: {
          select: {
            id: true,
            name: true,
            departmentHead: true,
            courses: {
              select: {
                id: true,
                code: true,
                title: true,
              },
            },
          },
        },
        students: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
          },
        },
      },
    })

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      })
    }

    res.status(200).json({
      success: true,
      data: faculty,
    })
  } catch (error) {
    console.error("Get faculty by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching faculty",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * @desc    Update faculty
 * @route   PUT /api/faculties/:id
 * @access  Private/Admin
 */
const updateFaculty = async (req, res) => {
  const { name, dean, establish } = req.body

  try {
    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: req.params.id },
    })

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      })
    }

    // If name is being changed, check if the new name already exists
    if (name && name !== faculty.name) {
      const existingFaculty = await prisma.faculty.findUnique({
        where: { name },
      })

      if (existingFaculty && existingFaculty.id !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: "Faculty with this name already exists",
        })
      }
    }

    // Update the faculty
    const updatedFaculty = await prisma.faculty.update({
      where: { id: req.params.id },
      data: {
        name: name || faculty.name,
        dean: dean || faculty.dean,
        establish: establish ? parseInt(establish) : faculty.establish,
      },
    })

    res.status(200).json({
      success: true,
      message: "Faculty updated successfully",
      data: updatedFaculty,
    })
  } catch (error) {
    console.error("Update faculty error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during faculty update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * @desc    Delete faculty
 * @route   DELETE /api/faculties/:id
 * @access  Private/Admin
 */
const deleteFaculty = async (req, res) => {
  try {
    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: req.params.id },
      include: {
        departments: true,
        students: true,
      },
    })

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      })
    }

    // Check if faculty has departments or students
    if (faculty.departments.length > 0 || faculty.students.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete faculty with associated departments or students",
      })
    }

    // Delete the faculty
    await prisma.faculty.delete({
      where: { id: req.params.id },
    })

    res.status(200).json({
      success: true,
      message: "Faculty deleted successfully",
    })
  } catch (error) {
    console.error("Delete faculty error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during faculty deletion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

export {
  createFaculty,
  getAllFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
}
