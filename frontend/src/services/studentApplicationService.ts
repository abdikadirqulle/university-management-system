import { api } from "./api";
import { StudentApplication } from "@/types/admission";

export interface StudentApplicationResponse {
  success: boolean;
  message?: string;
  data: StudentApplication;
}

export interface StudentApplicationsResponse {
  success: boolean;
  message?: string;
  count: number;
  data: StudentApplication[];
}

const studentApplicationService = {
  // Get all student applications
  getAllApplications: async (): Promise<StudentApplication[]> => {
    try {
      const response = await api.get<StudentApplicationsResponse>("/applications");
      if (!response.data.success) {
        throw new Error("Failed to fetch applications");
      }
      return response.data.data;
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  },

  // Get application by ID
  getApplicationById: async (id: string): Promise<StudentApplication> => {
    try {
      const response = await api.get<StudentApplicationResponse>(`/applications/${id}`);
      if (!response.data.success) {
        throw new Error("Failed to fetch application");
      }
      return response.data.data;
    } catch (error) {
      console.error("Error fetching application:", error);
      throw error;
    }
  },

  // Create a new application
  createApplication: async (application: Omit<StudentApplication, "id" | "applicationDate" | "status">): Promise<StudentApplication> => {
    try {
      const response = await api.post<StudentApplicationResponse>("/applications", application);
      if (!response.data.success) {
        throw new Error("Failed to create application");
      }
      return response.data.data;
    } catch (error) {
      console.error("Error creating application:", error);
      throw error;
    }
  },

  // Update an application
  updateApplication: async (id: string, data: Partial<StudentApplication>): Promise<StudentApplication> => {
    try {
      const response = await api.put<StudentApplicationResponse>(`/applications/${id}`, data);
      if (!response.data.success) {
        throw new Error("Failed to update application");
      }
      return response.data.data;
    } catch (error) {
      console.error("Error updating application:", error);
      throw error;
    }
  },

  // Delete an application
  deleteApplication: async (id: string): Promise<void> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/applications/${id}`);
      if (!response.data.success) {
        throw new Error("Failed to delete application");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      throw error;
    }
  },

  // Approve an application
  approveApplication: async (id: string, reviewedBy: string): Promise<string> => {
    try {
      const response = await api.put<StudentApplicationResponse & { studentId: string }>(`/applications/${id}/approve`, { reviewedBy });
      if (!response.data.success) {
        throw new Error("Failed to approve application");
      }
      return response.data.studentId;
    } catch (error) {
      console.error("Error approving application:", error);
      throw error;
    }
  },

  // Reject an application
  rejectApplication: async (id: string, reviewedBy: string, notes?: string): Promise<void> => {
    try {
      const response = await api.put<StudentApplicationResponse>(`/applications/${id}/reject`, { reviewedBy, notes });
      if (!response.data.success) {
        throw new Error("Failed to reject application");
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      throw error;
    }
  },
};

export default studentApplicationService;
