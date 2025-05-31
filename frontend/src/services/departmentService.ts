import { api } from "./api";
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from "../types/department";

export const departmentService = {
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await api.get("/departments");
    return response.data.data;
  },

  getDepartmentById: async (id: string): Promise<Department> => {
    const response = await api.get(`/departments/${id}`);
    return response.data.data;
  },

  createDepartment: async (department: CreateDepartmentDto): Promise<Department> => {
    const response = await api.post("/departments", department);
    return response.data.data;
  },

  updateDepartment: async (id: string, department: UpdateDepartmentDto): Promise<Department> => {
    const response = await api.put(`/departments/${id}`, department);
    return response.data.data;
  },

  deleteDepartment: async (id: string): Promise<void> => {
    await api.delete(`/departments/${id}`);
  }
};
