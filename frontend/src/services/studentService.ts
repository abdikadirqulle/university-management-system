import {
  Student,
  StudentResponse,
  StudentsResponse,
  StudentAccount,
} from "@/types/student";
import { api } from "./api";

const studentService = {
  // Get all students
  getAllStudents: async (): Promise<Student[]> => {
    const response = await api.get<StudentsResponse>("/students");
    if (!response.data.success) {
      throw new Error("Failed to fetch students");
    }
    return response.data.data;
  },

  // Get student by ID
  getStudentById: async (id: string): Promise<Student> => {
    const response = await api.get<StudentResponse>(`/students/${id}`);
    if (!response.data.success) {
      throw new Error("Failed to fetch student");
    }
    return response.data.data;
  },

  // Create a new student
  createStudent: async (studentData: Omit<Student, "id">): Promise<Student> => {
    const response = await api.post<StudentResponse>("/students", studentData);
    if (!response.data.success) {
      throw new Error("Failed to create student");
    }
    return response.data.data;
  },

  // Update student
  updateStudent: async (
    id: string,
    studentData: Partial<Student>,
  ): Promise<Student> => {
    const response = await api.put<StudentResponse>(
      `/students/${id}`,
      studentData,
    );
    if (!response.data.success) {
      throw new Error("Failed to update student");
    }
    return response.data.data;
  },

  // Delete student
  deleteStudent: async (id: string): Promise<void> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/students/${id}`,
    );
    if (!response.data.success) {
      throw new Error("Failed to delete student");
    }
  },

  // Toggle student activation status
  toggleStudentActivation: async (id: string): Promise<Student> => {
    const response = await api.patch<StudentResponse>(
      `/students/${id}/toggle-activation`,
    );
    if (!response.data.success) {
      throw new Error("Failed to toggle student activation");
    }
    return response.data.data;
  },

  // Get students by department
  getStudentsByDepartment: async (departmentId: string): Promise<Student[]> => {
    const response = await api.get<StudentsResponse>(
      `/students/department/${departmentId}`,
    );
    if (!response.data.success) {
      throw new Error("Failed to fetch students by department");
    }
    return response.data.data;
  },

  // Get students by faculty
  getStudentsByFaculty: async (facultyId: string): Promise<Student[]> => {
    const response = await api.get<StudentsResponse>(
      `/students/faculty/${facultyId}`,
    );
    if (!response.data.success) {
      throw new Error("Failed to fetch students by faculty");
    }
    return response.data.data;
  },

  // Update student account
  updateStudentAccount: async (
    id: string,
    accountData: { paidType: string; discount?: number },
  ): Promise<StudentAccount> => {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: StudentAccount;
    }>(`/students/${id}/account`, accountData);
    if (!response.data.success) {
      throw new Error("Failed to update student account");
    }
    return response.data.data;
  },
};

export default studentService;
