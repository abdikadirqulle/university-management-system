export interface Department {
  id: string;
  name: string;
  facultyId: string;
  departmentHead: string;
  price: number;
  semester?: string;
  batch?: string;
  createdAt?: string;
  updatedAt?: string;
  faculty?: {
    id: string;
    name: string;
  };
  courses?: {
    id: string;
    code: string;
    title: string;
  }[];
  students?: {
    id: string;
    studentId: string;
    fullName: string;
  }[];
}

export interface CreateDepartmentDto {
  name: string;
  facultyId: string;
  departmentHead: string;
  price: number;
  semester?: string;
  batch?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  facultyId?: string;
  departmentHead?: string;
  price?: number;
  semester?: string;
  batch?: string;
}
