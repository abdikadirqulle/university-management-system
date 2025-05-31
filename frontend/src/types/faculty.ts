export interface Faculty {
  id: string;
  name: string;
  dean: string;
  establish: number;
  createdAt?: string;
  updatedAt?: string;
  departments?: {
    id: string;
    name: string;
    departmentHead: string;
    courses?: {
      id: string;
      code: string;
      title: string;
    }[];
  }[];
  students?: {
    id: string;
    studentId: string;
    fullName: string;
  }[];
}

export interface CreateFacultyDto {
  name: string;
  dean: string;
  establish: number;
}

export interface UpdateFacultyDto {
  name?: string;
  dean?: string;
  establish?: number;
}
