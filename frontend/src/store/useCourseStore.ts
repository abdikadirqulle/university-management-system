import { create } from "zustand";
import { courseService } from "../services/courseService";
import { departmentService } from "../services/departmentService";
import { Course as ApiCourse, CreateCourseDto, UpdateCourseDto } from "../types/course";

// Frontend Course model (slightly different from API model for UI purposes)
export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  department: string; // Department name for display
  faculty?: string; // Faculty name for display
  credits: number;
  academicYear: string;
  semester: string;
  instructor: string;
}

interface CourseState {
  courses: Course[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCourses: () => Promise<void>;
  addCourse: (course: Omit<Course, "id">) => Promise<void>;
  updateCourse: (id: string, courseData: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch courses from the API
      const apiCourses = await courseService.getAllCourses();
      
      // Transform API courses to our frontend model
      const transformedCourses: Course[] = await Promise.all(
        apiCourses.map(async (course) => {
          let departmentName = "Unknown Department";
          let facultyName = "Unknown Faculty";
          
          // If department info is included in the response
          if (course.department) {
            departmentName = course.department.name;
            if (course.department.faculty) {
              facultyName = course.department.faculty.name;
            }
          } else if (course.departmentId) {
            // If not, fetch department details
            try {
              const department = await departmentService.getDepartmentById(course.departmentId);
              departmentName = department.name;
              if (department.faculty) {
                facultyName = department.faculty.name;
              }
            } catch (error) {
              console.error("Error fetching department:", error);
            }
          }
          
          return {
            id: course.id,
            code: course.code,
            title: course.title,
            departmentId: course.departmentId,
            department: departmentName,
            faculty: facultyName,
            credits: course.credits,
            academicYear: course.academicYear,
            semester: course.semester,
            instructor: course.instructor || "Not assigned",
          };
        })
      );

      set({ courses: transformedCourses, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch courses",
        isLoading: false,
      });
    }
  },

  addCourse: async (course: Omit<Course, "id">) => {
    set({ isLoading: true, error: null });
    try {
      // Create API DTO from frontend model
      const courseDto: CreateCourseDto = {
        code: course.code,
        title: course.title,
        departmentId: course.departmentId,
        credits: course.credits,
        academicYear: course.academicYear,
        semester: course.semester,
        instructor: course.instructor || "",
      };

      // Call API to create course
      const newCourse = await courseService.createCourse(courseDto);
      
      // Add the new course to the state
      set((state) => ({
        courses: [...state.courses, {
          id: newCourse.id,
          code: newCourse.code,
          title: newCourse.title,
          departmentId: newCourse.departmentId,
          department: course.department, // Use the name we already have
          faculty: course.faculty,
          credits: newCourse.credits,
          academicYear: newCourse.academicYear,
          semester: newCourse.semester,
          instructor: newCourse.instructor || "Not assigned",
        }],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add course",
        isLoading: false,
      });
    }
  },

  updateCourse: async (id: string, courseData: Partial<Course>) => {
    set({ isLoading: true, error: null });
    try {
      // Create API DTO from frontend model
      const updateDto: UpdateCourseDto = {};
      
      if (courseData.code) updateDto.code = courseData.code;
      if (courseData.title) updateDto.title = courseData.title;
      if (courseData.departmentId) updateDto.departmentId = courseData.departmentId;
      if (courseData.credits) updateDto.credits = courseData.credits;
      if (courseData.academicYear) updateDto.academicYear = courseData.academicYear;
      if (courseData.semester) updateDto.semester = courseData.semester;
      if (courseData.instructor) updateDto.instructor = courseData.instructor;

      // Call API to update course
      const updatedCourse = await courseService.updateCourse(id, updateDto);
      
      // Update the course in state
      set((state) => ({
        courses: state.courses.map((course) =>
          course.id === id ? { 
            ...course, 
            ...courseData,
            // Ensure we have the latest data from the API
            code: updatedCourse.code,
            title: updatedCourse.title,
            departmentId: updatedCourse.departmentId,
            credits: updatedCourse.credits,
            academicYear: updatedCourse.academicYear,
            semester: updatedCourse.semester,
            instructor: updatedCourse.instructor || "Not assigned",
          } : course
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update course",
        isLoading: false,
      });
    }
  },

  deleteCourse: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Call API to delete course
      await courseService.deleteCourse(id);

      // Remove the course from state
      set((state) => ({
        courses: state.courses.filter((course) => course.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete course",
        isLoading: false,
      });
    }
  },
}));
