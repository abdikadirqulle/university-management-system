import { create } from "zustand";
import { facultyService } from "../services/facultyService";
import { Faculty as ApiFaculty, CreateFacultyDto, UpdateFacultyDto } from "../types/faculty";

// Frontend Faculty model (extended for UI purposes)
export interface Faculty {
  id: string;
  name: string;
  dean: string;
  establish: number;
  description?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FacultyState {
  faculties: Faculty[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFaculties: () => Promise<void>;
  addFaculty: (faculty: Omit<Faculty, "id">) => Promise<void>;
  updateFaculty: (id: string, facultyData: Partial<Faculty>) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;
}

export const useFacultyStore = create<FacultyState>((set) => ({
  faculties: [],
  isLoading: false,
  error: null,

  fetchFaculties: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch faculties from the API
      const apiFaculties = await facultyService.getAllFaculties();
      
      // Transform API faculties to our frontend model
      const transformedFaculties: Faculty[] = apiFaculties.map((faculty) => ({
        id: faculty.id,
        name: faculty.name,
        dean: faculty.dean || "Not assigned",
        establish: faculty.establish || 0,
        description: "", // Add UI-only fields with defaults
        location: "Not specified",
        createdAt: faculty.createdAt,
        updatedAt: faculty.updatedAt
      }));

      set({ faculties: transformedFaculties, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch faculties",
        isLoading: false,
      });
    }
  },

  addFaculty: async (faculty: Omit<Faculty, "id">) => {
    set({ isLoading: true, error: null });
    try {
      // Create API DTO from frontend model
      const facultyDto: CreateFacultyDto = {
        name: faculty.name,
        dean: faculty.dean,
        establish: faculty.establish,
      };

      // Call API to create faculty
      const newFaculty = await facultyService.createFaculty(facultyDto);
      
      // Add the new faculty to the state
      set((state) => ({
        faculties: [...state.faculties, {
          id: newFaculty.id,
          name: newFaculty.name,
          dean: newFaculty.dean || "Not assigned",
          establish: newFaculty.establish,
          description: "", // UI-only field
          location: "Not specified", // UI-only field
          createdAt: newFaculty.createdAt,
          updatedAt: newFaculty.updatedAt,
        }],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add faculty",
        isLoading: false,
      });
    }
  },

  updateFaculty: async (id: string, facultyData: Partial<Faculty>) => {
    set({ isLoading: true, error: null });
    try {
      // Create API DTO from frontend model
      const updateDto: UpdateFacultyDto = {};
      
      if (facultyData.name) updateDto.name = facultyData.name;
      if (facultyData.dean) updateDto.dean = facultyData.dean;
      if (facultyData.establish) updateDto.establish = facultyData.establish;

      // Call API to update faculty
      const updatedFaculty = await facultyService.updateFaculty(id, updateDto);
      
      // Update the faculty in state
      set((state) => ({
        faculties: state.faculties.map((faculty) =>
          faculty.id === id ? { 
            ...faculty, 
            ...facultyData,
            // Ensure we have the latest data from the API
            name: updatedFaculty.name,
            dean: updatedFaculty.dean || "Not assigned",
            establish: updatedFaculty.establish,
            createdAt: updatedFaculty.createdAt,
            updatedAt: updatedFaculty.updatedAt,
            // Keep UI-only fields if they exist
            description: faculty.description || "",
            location: faculty.location || "Not specified",
          } : faculty
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update faculty",
        isLoading: false,
      });
    }
  },

  deleteFaculty: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Call API to delete faculty
      await facultyService.deleteFaculty(id);

      // Remove the faculty from state
      set((state) => ({
        faculties: state.faculties.filter((faculty) => faculty.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete faculty",
        isLoading: false,
      });
    }
  },
}));
