import { User } from "./auth";

export type Gender = "male" | "female";

export interface Student {
  id: string;
  studentId: string;
  userId: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  placeOfBirth: string;
  email: string;
  phoneNumber: string;
  highSchoolName: string;
  highSchoolCity: string;
  graduationYear: number;
  averagePass: number;
  facultyId: string;
  departmentId: string;
  session: string;
  academicYear: string;
  registerYear: number;
  semester: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  user?: User;
  faculty?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: "pending" | "paid" | "overdue" | "partial";
  type: "tuition" | "accommodation" | "library" | "other";
  tuitionFee?: number;
  otherCharges?: number;
  forwarded?: number;
  extraFee?: number;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentResponse {
  success: boolean;
  message?: string;
  data: Student;
}

export interface StudentsResponse {
  success: boolean;
  message?: string;
  count: number;
  data: Student[];
}
