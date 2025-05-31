import { api } from "./api";
import { Faculty, CreateFacultyDto, UpdateFacultyDto } from "../types/faculty";

export const facultyService = {
  getAllFaculties: async (): Promise<Faculty[]> => {
    const response = await api.get("/faculties");
    return response.data.data;
  },

  getFacultyById: async (id: string): Promise<Faculty> => {
    const response = await api.get(`/faculties/${id}`);
    return response.data.data;
  },

  createFaculty: async (faculty: CreateFacultyDto): Promise<Faculty> => {
    const response = await api.post("/faculties", faculty);
    return response.data.data;
  },

  updateFaculty: async (id: string, faculty: UpdateFacultyDto): Promise<Faculty> => {
    const response = await api.put(`/faculties/${id}`, faculty);
    return response.data.data;
  },

  deleteFaculty: async (id: string): Promise<void> => {
    await api.delete(`/faculties/${id}`);
  }
};
