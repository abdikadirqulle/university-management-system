import { create } from "zustand";
import { Student } from "@/types/student";
import studentService from "@/services/studentService";
import { toast } from "sonner";

interface StudentState {
  students: Student[];
  selectedStudent: Student | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStudents: () => Promise<void>;
  getStudentById: (id: string) => Promise<void>;
  addStudent: (student: Omit<Student, "id">) => Promise<void>;
  updateStudent: (id: string, studentData: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  getStudentsByDepartment: (departmentId: string) => Promise<void>;
  getStudentsByFaculty: (facultyId: string) => Promise<void>;
  toggleStudentActivation: (id: string) => Promise<void>;
  updateStudentAccount: (
    id: string,
    paidType: string,
    discount?: number,
    status?: string,
    scholarship?: number,
  ) => Promise<void>;
  resetSelectedStudent: () => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  students: [],
  selectedStudent: null,
  isLoading: false,
  error: null,

  fetchStudents: async () => {
    set({ isLoading: true, error: null });
    try {
      const students = await studentService.getAllStudents();
      set({ students, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch students";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  getStudentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const student = await studentService.getStudentById(id);
      set({ selectedStudent: student, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch student";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  addStudent: async (student: Omit<Student, "id">) => {
    set({ isLoading: true, error: null });
    try {
      const newStudent = await studentService.createStudent(student);
      set((state) => ({
        students: [...state.students, newStudent],
        isLoading: false,
      }));
      toast.success("Student added successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add student";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  updateStudent: async (id: string, studentData: Partial<Student>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedStudent = await studentService.updateStudent(
        id,
        studentData,
      );
      set((state) => ({
        students: state.students.map((student) =>
          student.id === id ? { ...student, ...updatedStudent } : student,
        ),
        selectedStudent:
          state.selectedStudent?.id === id
            ? { ...state.selectedStudent, ...updatedStudent }
            : state.selectedStudent,
        isLoading: false,
      }));
      toast.success("Student updated successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update student";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  deleteStudent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await studentService.deleteStudent(id);
      set((state) => ({
        students: state.students.filter((student) => student.id !== id),
        selectedStudent:
          state.selectedStudent?.id === id ? null : state.selectedStudent,
        isLoading: false,
      }));
      toast.success("Student deleted successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete student";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  getStudentsByDepartment: async (departmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const students =
        await studentService.getStudentsByDepartment(departmentId);
      set({ students, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch students by department";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  getStudentsByFaculty: async (facultyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const students = await studentService.getStudentsByFaculty(facultyId);
      set({ students, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch students by faculty";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  toggleStudentActivation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedStudent = await studentService.toggleStudentActivation(id);
      set((state) => ({
        students: state.students.map((student) =>
          student.id === id
            ? { ...student, isActive: updatedStudent.isActive }
            : student,
        ),
        selectedStudent:
          state.selectedStudent?.id === id
            ? { ...state.selectedStudent, isActive: updatedStudent.isActive }
            : state.selectedStudent,
        isLoading: false,
      }));
      const status = updatedStudent.isActive ? "activated" : "deactivated";
      toast.success(`Student ${status} successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to toggle student activation";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  updateStudentAccount: async (
    id: string,
    paidType: string,
    discount?: number,
    status?: string,
    scholarship?: number,
  ) => {
    set({ isLoading: true, error: null });
    try {
      await studentService.updateStudentAccount(id, {
        paidType,
        discount,
        status,
        scholarship,
      });

      // Update the student in the store
      set((state) => {
        const updatedStudents = state.students.map((student) => {
          if (student.id === id && student.studentAccount) {
            return {
              ...student,
              studentAccount: {
                ...student.studentAccount,
                paidType,
                ...(discount !== undefined && { discount }),
                ...(status !== undefined && { status }),
                ...(scholarship !== undefined && { scholarship }),
              },
            };
          }
          return student;
        });

        let updatedSelectedStudent = state.selectedStudent;
        if (
          state.selectedStudent?.id === id &&
          state.selectedStudent.studentAccount
        ) {
          updatedSelectedStudent = {
            ...state.selectedStudent,
            studentAccount: {
              ...state.selectedStudent.studentAccount,
              paidType,
              ...(discount !== undefined && { discount }),
              ...(status !== undefined && { status }),
              ...(scholarship !== undefined && { scholarship }),
            },
          };
        }

        return {
          students: updatedStudents,
          selectedStudent: updatedSelectedStudent,
          isLoading: false,
          error: null,
        };
      });

      toast.success("Student account updated successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update student account";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  resetSelectedStudent: () => {
    set({ selectedStudent: null });
  },
}));
