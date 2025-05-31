import { prisma } from "../config/db.js";

/**
 * Get all student applications
 * @route GET /api/applications
 * @access Private (Admin, Admission)
 */
export const getAllApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: {
        applicationDate: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get application by ID
 * @route GET /api/applications/:id
 * @access Private (Admin, Admission)
 */
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Create new application
 * @route POST /api/applications
 * @access Public
 */
export const createApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      gender,
      dateOfBirth,
      desiredDepartment,
      documents,
    } = req.body;

    // Check if email already exists in applications
    const existingApplication = await prisma.application.findFirst({
      where: {
        email,
        status: {
          in: ["pending", "approved"],
        },
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "An application with this email already exists",
      });
    }

    // Create new application
    const application = await prisma.application.create({
      data: {
        fullName,
        email,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        desiredDepartment,
        documents,
        status: "pending",
        applicationDate: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Update application
 * @route PUT /api/applications/:id
 * @access Private (Admin, Admission)
 */
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      gender,
      dateOfBirth,
      desiredDepartment,
      documents,
      status,
    } = req.body;

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        fullName: fullName || existingApplication.fullName,
        email: email || existingApplication.email,
        gender: gender || existingApplication.gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existingApplication.dateOfBirth,
        desiredDepartment: desiredDepartment || existingApplication.desiredDepartment,
        documents: documents || existingApplication.documents,
        status: status || existingApplication.status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Delete application
 * @route DELETE /api/applications/:id
 * @access Private (Admin, Admission)
 */
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Delete application
    await prisma.application.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Approve application
 * @route PUT /api/applications/:id/approve
 * @access Private (Admin, Admission)
 */
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewedBy } = req.body;

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Generate student ID
    const studentCount = await prisma.student.count();
    const studentId = `STU${(studentCount + 1).toString().padStart(5, '0')}`;

    // Find or create a user for the student
    let user = await prisma.user.findUnique({
      where: { email: existingApplication.email },
    });

    if (!user) {
      // Create a new user with student role
      user = await prisma.user.create({
        data: {
          name: existingApplication.fullName,
          email: existingApplication.email,
          password: "password123", // Default password, should be changed
          role: "student",
        },
      });
    }

    // Get department and faculty IDs
    const department = await prisma.department.findFirst({
      where: {
        name: existingApplication.desiredDepartment,
      },
      include: {
        faculty: true,
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Create student record
    const student = await prisma.student.create({
      data: {
        studentId,
        userId: user.id,
        fullName: existingApplication.fullName,
        gender: existingApplication.gender,
        dateOfBirth: existingApplication.dateOfBirth,
        placeOfBirth: "Not provided", // Default value
        email: existingApplication.email,
        phoneNumber: "Not provided", // Default value
        highSchoolName: "Not provided", // Default value
        highSchoolCity: "Not provided", // Default value
        graduationYear: new Date().getFullYear(), // Default value
        averagePass: 0, // Default value
        facultyId: department.facultyId,
        departmentId: department.id,
        session: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, // Default value
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, // Default value
        registerYear: new Date().getFullYear(),
        semester: "First", // Default value
      },
    });

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: "approved",
        reviewedBy,
        reviewedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Application approved successfully",
      data: updatedApplication,
      studentId,
    });
  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Reject application
 * @route PUT /api/applications/:id/reject
 * @access Private (Admin, Admission)
 */
export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewedBy, notes } = req.body;

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: "rejected",
        reviewedBy,
        reviewedAt: new Date(),
        notes,
      },
    });

    res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
