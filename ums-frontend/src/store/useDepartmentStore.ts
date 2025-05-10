import { create } from "zustand";
import { departmentService } from "../services/departmentService";
import { facultyService } from "../services/facultyService";
import { Department as ApiDepartment, CreateDepartmentDto, UpdateDepartmentDto } from "../types/department";

// Frontend Department model (extended for UI purposes)
export interface Department {
  id: string;
  name: string;
  facultyId: string;
  facultyName: string; // For display purposes
  departmentHead: string;
  description?: string; // UI-only field
  email?: string; // UI-only field
  phone?: string; // UI-only field
  createdAt?: string;
  updatedAt?: string;
}

interface DepartmentState {
  departments: Department[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDepartments: () => Promise<void>;
  addDepartment: (department: Omit<Department, "id">) => Promise<void>;
  updateDepartment: (id: string, departmentData: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
}

export const useDepartmentStore = create<DepartmentState>((set) => ({
  departments: [],
  isLoading: false,
  error: null,

  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch departments from the API
      const apiDepartments = await departmentService.getAllDepartments();
      
      // Transform API departments to our frontend model with faculty names
      const transformedDepartments: Department[] = await Promise.all(
        apiDepartments.map(async (department) => {
          let facultyName = "Unknown Faculty";
          
          // If faculty info is included in the response
          if (department.faculty) {
            facultyName = department.faculty.name;
          } else if (department.facultyId) {
            // If not, fetch faculty details
            try {
              const faculty = await facultyService.getFacultyById(department.facultyId);
              facultyName = faculty.name;
            } catch (error) {
              console.error("Error fetching faculty:", error);
            }
          }
          
          return {
            id: department.id,
            name: department.name,
            facultyId: department.facultyId,
            facultyName,
            departmentHead: department.departmentHead || "Not assigned",
            description: "", // UI-only field with default
            email: "", // UI-only field with default
            phone: "", // UI-only field with default
            createdAt: department.createdAt,
            updatedAt: department.updatedAt,
          };
        })
      );

      set({ departments: transformedDepartments, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch departments",
        isLoading: false,
      });
    }
  },

  addDepartment: async (department: Omit<Department, "id">) => {
    set({ isLoading: true, error: null });
    try {
      // Create API DTO from frontend model
      const departmentDto: CreateDepartmentDto = {
        name: department.name,
        facultyId: department.facultyId,
        departmentHead: department.departmentHead,
      };

      // Call API to create department
      const newDepartment = await departmentService.createDepartment(departmentDto);
      
      // Add the new department to the state
      set((state) => ({
        departments: [...state.departments, {
          id: newDepartment.id,
          name: newDepartment.name,
          facultyId: newDepartment.facultyId,
          facultyName: department.facultyName, // Use the name we already have
          departmentHead: newDepartment.departmentHead || "Not assigned",
          description: department.description || "", // Keep UI-only field
          email: department.email || "", // Keep UI-only field
          phone: department.phone || "", // Keep UI-only field
          createdAt: newDepartment.createdAt,
          updatedAt: newDepartment.updatedAt,
        }],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add department",
        isLoading: false,
      });
    }
  },

  updateDepartment: async (id: string, departmentData: Partial<Department>) => {
    set({ isLoading: true, error: null });
    try {
      // Create API DTO from frontend model
      const updateDto: UpdateDepartmentDto = {};
      
      if (departmentData.name) updateDto.name = departmentData.name;
      if (departmentData.facultyId) updateDto.facultyId = departmentData.facultyId;
      if (departmentData.departmentHead) updateDto.departmentHead = departmentData.departmentHead;

      // Call API to update department
      const updatedDepartment = await departmentService.updateDepartment(id, updateDto);
      
      // Update the department in state
      set((state) => ({
        departments: state.departments.map((department) =>
          department.id === id ? { 
            ...department, 
            ...departmentData,
            // Ensure we have the latest data from the API
            name: updatedDepartment.name,
            facultyId: updatedDepartment.facultyId,
            departmentHead: updatedDepartment.departmentHead || "Not assigned",
            createdAt: updatedDepartment.createdAt,
            updatedAt: updatedDepartment.updatedAt,
            // Keep UI-only fields if they exist
            description: department.description || "",
            email: department.email || "",
            phone: department.phone || "",
            // Update faculty name if facultyId changed
            facultyName: departmentData.facultyId !== department.facultyId && departmentData.facultyName 
              ? departmentData.facultyName 
              : department.facultyName,
          } : department
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update department",
        isLoading: false,
      });
    }
  },

  deleteDepartment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Call API to delete department
      await departmentService.deleteDepartment(id);

      // Remove the department from state
      set((state) => ({
        departments: state.departments.filter((department) => department.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete department",
        isLoading: false,
      });
    }
  },
}));
