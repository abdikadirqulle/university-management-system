export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  credits: number;
  semester: string;
  academicYear: string;
  instructor: string;
  createdAt?: string;
  updatedAt?: string;
  department?: {
    name: string;
    faculty?: {
      name: string;
    };
  };
}

export interface CreateCourseDto {
  code: string;
  title: string;
  departmentId: string;
  credits: number;
  semester: string;
  academicYear: string;
  instructor: string;
}

export interface UpdateCourseDto {
  code?: string;
  title?: string;
  departmentId?: string;
  credits?: number;
  semester?: string;
  academicYear?: string;
  instructor?: string;
}
