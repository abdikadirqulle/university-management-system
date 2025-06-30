import { User } from "./auth";
import { PaymentStatus, PaymentType } from "./payment";

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
  averagePass: string;
  facultyId: string;
  departmentId: string;
  session: string;
  academicYear: string;
  registerYear: number;
  semester: string;
  batch?: string;
  isActive: boolean;
  status: string;
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
    price?: number;
    semester?: string;
    batch?: string;
  };
  payments?: Payment[];
  studentAccount?: {
    id: string;
    studentId: string;
    academicYear: string;
    semester: string;
    tuitionFee: number;
    otherCharges: number;
    discount: number;
    is_active?: boolean;
    paidType?: string;
    totalDue: number;
    status?: string;
    scholarship?: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface StudentAccount {
  id: string;
  studentId: string;
  academicYear: string;
  semester: string;
  tuitionFee: number;
  otherCharges: number;
  discount: number;
  totalDue: number;
  paidAmount: number;
  paidType?: string;
  status?: string;
  is_active?: boolean;
  scholarship?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: PaymentStatus;
  type: PaymentType;
  tuitionFee?: number;
  otherCharges?: number;
  forwarded?: number;
  extraFee?: number;
  discount?: number;
  paid: number;
  net: number;
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
