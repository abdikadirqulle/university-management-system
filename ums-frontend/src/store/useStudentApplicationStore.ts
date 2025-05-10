import { create } from "zustand";
import { StudentApplication } from "@/types/admission";
import studentApplicationService from "@/services/studentApplicationService";
import { toast } from "sonner";

interface ApplicationState {
  applications: StudentApplication[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchApplications: () => Promise<void>;
  addApplication: (
    application: Omit<StudentApplication, "id" | "applicationDate" | "status">,
  ) => Promise<void>;
  updateApplication: (
    id: string,
    data: Partial<StudentApplication>,
  ) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  approveApplication: (id: string, reviewedBy: string) => Promise<string>;
  rejectApplication: (
    id: string,
    reviewedBy: string,
    notes?: string,
  ) => Promise<void>;
}

export const useStudentApplicationStore = create<ApplicationState>(
  (set, get) => ({
    applications: [],
    isLoading: false,
    error: null,

    fetchApplications: async () => {
      set({ isLoading: true, error: null });
      try {
        const applications = await studentApplicationService.getAllApplications();
        set({ applications, isLoading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch applications";
        toast.error(errorMessage);
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    addApplication: async (application) => {
      set({ isLoading: true, error: null });
      try {
        const newApplication = await studentApplicationService.createApplication(application);
        set((state) => ({
          applications: [...state.applications, newApplication],
          isLoading: false,
        }));
        toast.success("Application submitted successfully");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to add application";
        toast.error(errorMessage);
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    updateApplication: async (id, data) => {
      set({ isLoading: true, error: null });
      try {
        const updatedApplication = await studentApplicationService.updateApplication(id, data);
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? updatedApplication : app
          ),
          isLoading: false,
        }));
        toast.success("Application updated successfully");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update application";
        toast.error(errorMessage);
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    deleteApplication: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await studentApplicationService.deleteApplication(id);
        set((state) => ({
          applications: state.applications.filter((app) => app.id !== id),
          isLoading: false,
        }));
        toast.success("Application deleted successfully");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete application";
        toast.error(errorMessage);
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    approveApplication: async (id, reviewedBy) => {
      set({ isLoading: true, error: null });
      try {
        const studentId = await studentApplicationService.approveApplication(id, reviewedBy);
        
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id
              ? {
                  ...app,
                  status: "approved",
                  reviewedBy,
                  reviewedAt: new Date().toISOString(),
                }
              : app
          ),
          isLoading: false,
        }));
        
        toast.success("Application approved successfully");
        return studentId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to approve application";
        toast.error(errorMessage);
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },

    rejectApplication: async (id, reviewedBy, notes) => {
      set({ isLoading: true, error: null });
      try {
        await studentApplicationService.rejectApplication(id, reviewedBy, notes);
        
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id
              ? {
                  ...app,
                  status: "rejected",
                  reviewedBy,
                  reviewedAt: new Date().toISOString(),
                  notes,
                }
              : app
          ),
          isLoading: false,
        }));
        
        toast.success("Application rejected successfully");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to reject application";
        toast.error(errorMessage);
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },
  }),
);
