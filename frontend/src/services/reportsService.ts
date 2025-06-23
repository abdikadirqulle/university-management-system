import { api } from "./api";

export interface ReportFilters {
  academicYear?: string;
  departmentId?: string;
}

export interface EnrollmentTrend {
  month: string;
  students: number;
}

export interface FacultyDistribution {
  name: string;
  value: number;
  students: number;
}

export interface CourseEnrollment {
  name: string;
  students: number;
  department: string;
  code: string;
  credits: number;
  instructor: string;
}

export interface EnrollmentByDepartment {
  id: string;
  department: string;
  faculty: string;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  fullTime: number;
  partTime: number;
}

export interface ReportsData {
  enrollmentTrends: EnrollmentTrend[];
  facultyDistribution: FacultyDistribution[];
  courseEnrollment: CourseEnrollment[];
  enrollmentByDepartment: EnrollmentByDepartment[];
}

const reportsService = {
  // Get enrollment trends data
  getEnrollmentTrends: async (
    filters: ReportFilters = {},
  ): Promise<EnrollmentTrend[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.academicYear)
        params.append("academicYear", filters.academicYear);
      if (filters.departmentId)
        params.append("departmentId", filters.departmentId);

      const response = await api.get(`/reports/enrollment-trends?${params}`);
      if (!response.data.success) {
        throw new Error("Failed to fetch enrollment trends");
      }
      return response.data.data;
    } catch (error) {
      console.error("Error fetching enrollment trends:", error);
      return [];
    }
  },

  // Get faculty distribution data
  getFacultyDistribution: async (
    filters: ReportFilters = {},
  ): Promise<FacultyDistribution[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.academicYear)
        params.append("academicYear", filters.academicYear);
      if (filters.departmentId)
        params.append("departmentId", filters.departmentId);

      const response = await api.get(`/reports/faculty-distribution?${params}`);
      if (!response.data.success) {
        throw new Error("Failed to fetch faculty distribution");
      }
      return response.data.data;
    } catch (error) {
      console.error("Error fetching faculty distribution:", error);
      return [];
    }
  },

  // Get course enrollment data
  getCourseEnrollment: async (
    filters: ReportFilters = {},
  ): Promise<CourseEnrollment[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.academicYear)
        params.append("academicYear", filters.academicYear);
      if (filters.departmentId)
        params.append("departmentId", filters.departmentId);

      const response = await api.get(`/reports/course-enrollment?${params}`);
      if (!response.data.success) {
        throw new Error("Failed to fetch course enrollment");
      }
      return response.data.data;
    } catch (error) {
      console.error("Error fetching course enrollment:", error);
      return [];
    }
  },

  // Get enrollment by department data
  getEnrollmentByDepartment: async (
    filters: ReportFilters = {},
  ): Promise<EnrollmentByDepartment[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.academicYear)
        params.append("academicYear", filters.academicYear);
      if (filters.departmentId)
        params.append("departmentId", filters.departmentId);

      const response = await api.get(
        `/reports/enrollment-by-department?${params}`,
      );
      if (!response.data.success) {
        throw new Error("Failed to fetch enrollment by department");
      }
      return response.data.data;
    } catch (error) {
      console.error("Error fetching enrollment by department:", error);
      return [];
    }
  },

  // Get all reports data
  getAllReportsData: async (
    filters: ReportFilters = {},
  ): Promise<ReportsData> => {
    try {
      const [
        enrollmentTrends,
        facultyDistribution,
        courseEnrollment,
        enrollmentByDepartment,
      ] = await Promise.all([
        reportsService.getEnrollmentTrends(filters),
        reportsService.getFacultyDistribution(filters),
        reportsService.getCourseEnrollment(filters),
        reportsService.getEnrollmentByDepartment(filters),
      ]);

      return {
        enrollmentTrends,
        facultyDistribution,
        courseEnrollment,
        enrollmentByDepartment,
      };
    } catch (error) {
      console.error("Error fetching all reports data:", error);
      return {
        enrollmentTrends: [],
        facultyDistribution: [],
        courseEnrollment: [],
        enrollmentByDepartment: [],
      };
    }
  },
};

export default reportsService;
