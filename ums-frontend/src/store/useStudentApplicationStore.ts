
import { create } from 'zustand';
import { StudentApplication } from '@/types/admission';

interface ApplicationState {
  applications: StudentApplication[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchApplications: () => Promise<void>;
  addApplication: (application: Omit<StudentApplication, 'id' | 'applicationDate' | 'status'>) => Promise<void>;
  updateApplication: (id: string, data: Partial<StudentApplication>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  approveApplication: (id: string, reviewedBy: string) => Promise<string>;
  rejectApplication: (id: string, reviewedBy: string, notes?: string) => Promise<void>;
}

export const useStudentApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  isLoading: false,
  error: null,
  
  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      // This would be an API call in a real app
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample data
      const sampleApplications: StudentApplication[] = [
        {
          id: '1',
          fullName: 'John Smith',
          email: 'john.smith@example.com',
          gender: 'male',
          dateOfBirth: '1999-05-15',
          desiredDepartment: 'Computer Science',
          status: 'pending',
          applicationDate: '2023-06-10',
        },
        {
          id: '2',
          fullName: 'Maria Garcia',
          email: 'maria.garcia@example.com',
          gender: 'female',
          dateOfBirth: '2000-03-22',
          desiredDepartment: 'Business Administration',
          status: 'approved',
          applicationDate: '2023-05-28',
          reviewedBy: 'Admin User',
          reviewedAt: '2023-06-05',
        },
        {
          id: '3',
          fullName: 'Ahmed Khan',
          email: 'ahmed.khan@example.com',
          gender: 'male',
          dateOfBirth: '1998-11-08',
          desiredDepartment: 'Electrical Engineering',
          status: 'rejected',
          applicationDate: '2023-06-01',
          reviewedBy: 'Admin User',
          reviewedAt: '2023-06-07',
          notes: 'Missing prerequisite qualifications',
        },
      ];
      
      set({ applications: sampleApplications, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch applications', 
        isLoading: false 
      });
    }
  },
  
  addApplication: async (application) => {
    set({ isLoading: true, error: null });
    try {
      // This would be an API call in a real app
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newApplication: StudentApplication = {
        ...application,
        id: String(Date.now()),
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'pending',
      };
      
      set(state => ({ 
        applications: [...state.applications, newApplication],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add application', 
        isLoading: false 
      });
    }
  },
  
  updateApplication: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      // This would be an API call in a real app
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set(state => ({
        applications: state.applications.map(app => 
          app.id === id ? { ...app, ...data } : app
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update application', 
        isLoading: false 
      });
    }
  },
  
  deleteApplication: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // This would be an API call in a real app
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set(state => ({
        applications: state.applications.filter(app => app.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete application', 
        isLoading: false 
      });
    }
  },
  
  approveApplication: async (id, reviewedBy) => {
    set({ isLoading: true, error: null });
    try {
      // This would be an API call in a real app
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate student ID - in a real app this would be done on the server
      const studentId = `STU${Math.floor(10000 + Math.random() * 90000)}`;
      
      set(state => ({
        applications: state.applications.map(app => 
          app.id === id ? { 
            ...app, 
            status: 'approved', 
            reviewedBy, 
            reviewedAt: new Date().toISOString() 
          } : app
        ),
        isLoading: false
      }));
      
      // Return the generated student ID
      return studentId;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to approve application', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  rejectApplication: async (id, reviewedBy, notes) => {
    set({ isLoading: true, error: null });
    try {
      // This would be an API call in a real app
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set(state => ({
        applications: state.applications.map(app => 
          app.id === id ? { 
            ...app, 
            status: 'rejected', 
            reviewedBy, 
            reviewedAt: new Date().toISOString(),
            notes: notes || app.notes
          } : app
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to reject application', 
        isLoading: false 
      });
    }
  },
}));
