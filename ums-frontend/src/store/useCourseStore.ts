import { create } from "zustand";

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  credits: number;
  description: string;
  semester: string;
  instructor?: string;
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
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sample data
      const sampleCourses: Course[] = [
        {
          id: "1",
          code: "CS101",
          title: "Introduction to Computer Science",
          department: "Computer Science",
          credits: 3,
          description:
            "An introductory course covering the basics of computer science.",
          semester: "Fall 2023",
          instructor: "Professor Johnson",
        },
        {
          id: "2",
          code: "BUS200",
          title: "Business Economics",
          department: "Business",
          credits: 4,
          description: "Study of economic principles in business contexts.",
          semester: "Spring 2024",
          instructor: "Dean Smith",
        },
        {
          id: "3",
          code: "ENG150",
          title: "Engineering Mechanics",
          department: "Engineering",
          credits: 4,
          description:
            "Basic principles of mechanics for engineering applications.",
          semester: "Fall 2023",
          instructor: "Dr. Martinez",
        },
        {
          id: "4",
          code: "MTH201",
          title: "Calculus II",
          department: "Mathematics",
          credits: 3,
          description:
            "Advanced calculus topics including integration techniques.",
          semester: "Spring 2024",
          instructor: "Dr. Lee",
        },
        {
          id: "5",
          code: "PHY105",
          title: "Physics for Scientists",
          department: "Physics",
          credits: 4,
          description: "Comprehensive introduction to classical physics.",
          semester: "Fall 2023",
          instructor: "Professor Wilson",
        },
      ];

      set({ courses: sampleCourses, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch courses",
        isLoading: false,
      });
    }
  },

  addCourse: async (course: Omit<Course, "id">) => {
    set({ isLoading: true, error: null });
    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newCourse: Course = {
        ...course,
        id: String(Date.now()),
      };

      set((state) => ({
        courses: [...state.courses, newCourse],
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
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000));

      set((state) => ({
        courses: state.courses.map((course) =>
          course.id === id ? { ...course, ...courseData } : course,
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update course",
        isLoading: false,
      });
    }
  },

  deleteCourse: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000));

      set((state) => ({
        courses: state.courses.filter((course) => course.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete course",
        isLoading: false,
      });
    }
  },
}));
