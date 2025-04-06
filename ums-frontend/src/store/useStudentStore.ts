
import { create } from "zustand"
import { Student } from "@/types/student"

interface StudentState {
  students: Student[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchStudents: () => Promise<void>
  addStudent: (student: Student) => Promise<void>
  updateStudent: (id: string, studentData: Partial<Student>) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
}

// Sample student data for initial state
const sampleStudents: Student[] = [
  {
    id: "1",
    studentId: "STU001",
    fullName: "John Doe",
    email: "john.doe@university.edu",
    department: "Computer Science",
    enrollmentDate: "2023-09-01",
    semester: "Fall 2023",
    session: "2023-2024",
    status: "active",
    gender: "male",
    dateOfBirth: "2000-05-15",
    contactNumber: "+1234567890",
    address: "123 Campus Drive",
  },
  {
    id: "2",
    studentId: "STU002",
    fullName: "Jane Smith",
    email: "jane.smith@university.edu",
    department: "Electrical Engineering",
    enrollmentDate: "2023-09-01",
    semester: "Fall 2023",
    session: "2023-2024",
    status: "active",
    gender: "female",
    dateOfBirth: "2001-07-22",
    contactNumber: "+1987654321",
    address: "456 University Blvd",
  },
  {
    id: "3",
    studentId: "STU003",
    fullName: "Michael Johnson",
    email: "michael.johnson@university.edu",
    department: "Business Administration",
    enrollmentDate: "2022-01-15",
    semester: "Spring 2023",
    session: "2022-2023",
    status: "active",
    gender: "male",
    dateOfBirth: "1999-11-30",
    contactNumber: "+1122334455",
    address: "789 College Ave",
  },
  {
    id: "4",
    studentId: "STU004",
    fullName: "Emily Brown",
    email: "emily.brown@university.edu",
    department: "Psychology",
    enrollmentDate: "2022-09-01",
    semester: "Spring 2023",
    session: "2022-2023",
    status: "inactive",
    gender: "female",
    dateOfBirth: "2000-02-14",
    contactNumber: "+1555666777",
    address: "321 Dorm Street",
  },
  {
    id: "5",
    studentId: "STU005",
    fullName: "David Wilson",
    email: "david.wilson@university.edu",
    department: "Mathematics",
    enrollmentDate: "2021-09-01",
    semester: "Fall 2022",
    session: "2021-2022",
    status: "graduated",
    gender: "male",
    dateOfBirth: "1998-09-10",
    contactNumber: "+1777888999",
    address: "654 Graduate Lane",
  },
]

export const useStudentStore = create<StudentState>((set) => ({
  students: [],
  isLoading: false,
  error: null,

  fetchStudents: async () => {
    set({ isLoading: true, error: null })
    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set({ students: sampleStudents, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch students",
        isLoading: false,
      })
    }
  },

  addStudent: async (student: Student) => {
    set({ isLoading: true, error: null })
    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000))

      set((state) => ({
        students: [...state.students, { ...student, id: String(Date.now()) }],
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add student",
        isLoading: false,
      })
    }
  },

  updateStudent: async (id: string, studentData: Partial<Student>) => {
    set({ isLoading: true, error: null })
    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000))

      set((state) => ({
        students: state.students.map((student) =>
          student.id === id ? { ...student, ...studentData } : student
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update student",
        isLoading: false,
      })
    }
  },

  deleteStudent: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000))

      set((state) => ({
        students: state.students.filter((student) => student.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete student",
        isLoading: false,
      })
    }
  },
}))
