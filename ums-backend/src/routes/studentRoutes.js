import express from "express"

import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByDepartment,
  getStudentsByFaculty,
}  from '../controllers/studentController.js';

import { authenticateUser, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all students - Admin and Admission access
router.get('/', authenticateUser,
  // authorize(['admin', 'admission', 'financial']),
   getAllStudents);

// Get student by ID - Admin, Admission, and Student (own record) access
router.get('/:id', authenticateUser,
  //  authorize(['admin', 'admission', 'student']),
    getStudentById);

// Create new student - Admin and Admission access
router.post('/', authenticateUser,
  // authorize(['admin', 'admission']),
   createStudent);

// Update student - Admin and Admission access
router.put('/:id', authenticateUser,
  // authorize(['admin', 'admission']),
   updateStudent);

// Delete student - Admin only access
router.delete('/:id', authenticateUser,
  // authorize(['admin', 'admission']),
   deleteStudent);

// Get students by department - Admin and Admission access
router.get('/department/:departmentId', authenticateUser,
  // authorize(['admin', 'admission']),
   getStudentsByDepartment);

// Get students by faculty - Admin and Admission access
router.get('/faculty/:facultyId', authenticateUser,
  // authorize(['admin', 'admission']),
   getStudentsByFaculty);

export default router
