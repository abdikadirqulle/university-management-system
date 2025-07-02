import { prisma } from "../../config/db.js"

// Get university settings
export const getUniversitySettings = async (req, res) => {
  try {
    const settings = await prisma.universitySettings.findFirst()
    if (!settings) {
      return res.status(404).json({ message: "University settings not found" })
    }
    res.json(settings)
  } catch (error) {
    res.status(500).json({
      message: "Error fetching university settings",
      error: error.message,
    })
  }
}

// Update university settings
export const updateUniversitySettings = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body

    // Get the first settings record if it exists
    const existingSettings = await prisma.universitySettings.findFirst()

    let settings

    if (existingSettings) {
      // Update existing settings
      settings = await prisma.universitySettings.update({
        where: {
          id: existingSettings.id,
        },
        data: {
          name,
          email,
          phone,
          address,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new settings
      settings = await prisma.universitySettings.create({
        data: {
          name,
          email,
          phone,
          address,
        },
      })
    }

    res.json(settings)
  } catch (error) {
    res.status(500).json({
      message: "Error updating university settings",
      error: error.message,
    })
  }
}

// Get system settings
export const getSystemSettings = async (req, res) => {
  try {
    const settings = await prisma.systemSettings.findFirst()
    if (!settings) {
      return res.status(404).json({ message: "System settings not found" })
    }
    res.json(settings)
  } catch (error) {
    res.status(500).json({
      message: "Error fetching system settings",
      error: error.message,
    })
  }
}

// Update system settings
export const updateSystemSettings = async (req, res) => {
  try {
    const {
      theme,
      language,
      dateFormat,
      emailNotifications,
      smsNotifications,
    } = req.body

    // Get the first settings record if it exists
    const existingSettings = await prisma.systemSettings.findFirst()

    let settings

    if (existingSettings) {
      // Update existing settings
      settings = await prisma.systemSettings.update({
        where: {
          id: existingSettings.id,
        },
        data: {
          theme,
          language,
          dateFormat,
          emailNotifications,
          smsNotifications,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new settings
      settings = await prisma.systemSettings.create({
        data: {
          theme,
          language,
          dateFormat,
          emailNotifications,
          smsNotifications,
        },
      })
    }

    res.json(settings)
  } catch (error) {
    res.status(500).json({
      message: "Error updating system settings",
      error: error.message,
    })
  }
}
