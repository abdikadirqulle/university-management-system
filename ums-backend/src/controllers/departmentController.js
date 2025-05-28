import { prisma } from "../config/db.js"

/**
 * @desc    Create a new department
 * @route   POST /api/departments
 * @access  Private/Admin
 */
const createDepartment = async (req, res) => {
  const { name, facultyId, departmentHead, price, semester, batch } = req.body

  try {
    // Check if department with the same name already exists
    const existingDepartment = await prisma.department.findUnique({
      where: { name },
    })

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department with this name already exists",
      })
    }

    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    })

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      })
    }

    // Create the department
    const newDepartment = await prisma.department.create({
      data: {
        name,
        facultyId,
        departmentHead,
        price: price ? parseFloat(price) : 0,
        semester,
        batch,
      },
    })

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: newDepartment,
    })
  } catch (error) {
    console.error("Create department error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during department creation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * @desc    Get all departments
 * @route   GET /api/departments
 * @access  Public
 */
const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
          },
        },
        courses: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    })

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    })
  } catch (error) {
    console.error("Get all departments error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching departments",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * @desc    Get department by ID
 * @route   GET /api/departments/:id
 * @access  Public
 */
const getDepartmentById = async (req, res) => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: req.params.id },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
          },
        },
        courses: {
          select: {
            id: true,
            code: true,
            title: true,
            credits: true,
            semester: true,
            instructor: true,
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

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    res.status(200).json({
      success: true,
      data: department,
    })
  } catch (error) {
    console.error("Get department by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching department",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * @desc    Update department
 * @route   PUT /api/departments/:id
 * @access  Private/Admin
 */
const updateDepartment = async (req, res) => {
  const { name, facultyId, departmentHead, price, semester, batch } = req.body

  try {
    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: req.params.id },
    })

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    // If name is being changed, check if the new name already exists
    if (name && name !== department.name) {
      const existingDepartment = await prisma.department.findUnique({
        where: { name },
      })

      if (existingDepartment && existingDepartment.id !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: "Department with this name already exists",
        })
      }
    }

    // If facultyId is provided, check if faculty exists
    if (facultyId && facultyId !== department.facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
      })

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty not found",
        })
      }
    }

    // Update the department
    const updatedDepartment = await prisma.department.update({
      where: { id: req.params.id },
      data: {
        name: name || department.name,
        facultyId: facultyId || department.facultyId,
        departmentHead: departmentHead || department.departmentHead,
        price: price !== undefined ? parseFloat(price) : department.price,
        semester: semester !== undefined ? semester : department.semester,
        batch: batch !== undefined ? batch : department.batch,
      },
    })

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: updatedDepartment,
    })
  } catch (error) {
    console.error("Update department error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during department update",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * @desc    Delete department
 * @route   DELETE /api/departments/:id
 * @access  Private/Admin
 */
const deleteDepartment = async (req, res) => {
  try {
    // Check if department exists
    const department = await prisma.department.findUnique({
      where: { id: req.params.id },
      include: {
        courses: true,
        students: true,
      },
    })

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      })
    }

    // Check if department has courses or students
    if (department.courses.length > 0 || department.students.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete department with associated courses or students",
      })
    }

    // Delete the department
    await prisma.department.delete({
      where: { id: req.params.id },
    })

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    })
  } catch (error) {
    console.error("Delete department error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during department deletion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

export {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
}
