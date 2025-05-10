import { Student } from "./student";

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  OVERDUE = "overdue",
  PARTIAL = "partial",
}

export enum PaymentType {
  TUITION = "tuition",
  ACCOMMODATION = "accommodation",
  LIBRARY = "library",
  OTHER = "other",
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
  createdAt: string;
  updatedAt: string;
  student?: {
    studentId: string;
    fullName: string;
    email: string;
    department: {
      name: string;
    };
  };
}

export interface PaymentFormData {
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
}

export interface PaymentStatistics {
  totalPayments: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  paymentsByType: {
    type: string;
    _count: { id: number };
    _sum: { amount: number };
  }[];
}
