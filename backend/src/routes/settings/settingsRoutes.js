import express from "express"
import {
  getUniversitySettings,
  updateUniversitySettings,
  getSystemSettings,
  updateSystemSettings,
} from "../../controllers/settings/settingsController.js"

const router = express.Router()

// University settings routes
router.get("/university", getUniversitySettings)
router.put("/university", updateUniversitySettings)

// System settings routes
router.get("/system", getSystemSettings)
router.put("/system", updateSystemSettings)

export default router
