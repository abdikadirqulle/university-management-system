import { api } from "./api";
import { Course, CreateCourseDto, UpdateCourseDto } from "../types/course";

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    const response = await api.get("/courses");
    return response.data.data;
  },

  getCourseById: async (id: string): Promise<Course> => {
    const response = await api.get(`/courses/${id}`);
    return response.data.data;
  },

  createCourse: async (course: CreateCourseDto): Promise<Course> => {
    const response = await api.post("/courses", course);
    return response.data.data;
  },

  updateCourse: async (id: string, course: UpdateCourseDto): Promise<Course> => {
    const response = await api.put(`/courses/${id}`, course);
    return response.data.data;
  },

  deleteCourse: async (id: string): Promise<void> => {
    await api.delete(`/courses/${id}`);
  }
};
