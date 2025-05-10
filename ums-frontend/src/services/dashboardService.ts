import { api } from "./api";

export interface DashboardStats {
  totalStudents: number;
  totalFaculties: number;
  totalDepartments: number;
  totalCourses: number;
}

export interface EnrollmentTrend {
  year: number;
  students: number;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    enrollmentTrends: EnrollmentTrend[];
  };
}

const dashboardService = {
  // Get dashboard statistics for admin
  getAdminStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get<DashboardResponse>("/dashboard/admin");
      
      if (!response.data.success) {
        throw new Error("Failed to fetch dashboard statistics");
      }
      
      return response.data.data.stats;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return default values if API call fails
      return {
        totalStudents: 0,
        totalFaculties: 0,
        totalDepartments: 0,
        totalCourses: 0,
      };
    }
  },
  
  // Get enrollment trends for charts
  getEnrollmentTrends: async (): Promise<EnrollmentTrend[]> => {
    try {
      const response = await api.get<DashboardResponse>("/dashboard/admin");
      
      if (!response.data.success) {
        throw new Error("Failed to fetch enrollment trends");
      }
      
      return response.data.data.enrollmentTrends || [];
    } catch (error) {
      console.error("Error fetching enrollment trends:", error);
      return [];
    }
  },
};

export default dashboardService;
