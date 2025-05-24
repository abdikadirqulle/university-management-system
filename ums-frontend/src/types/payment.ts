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

export interface StudentFinancial {
  studentId: string;
  fullName: string;
  batch: string;
  sem: string;
  session: string;
  tuitionFee: number;
  otherCharges: number;
  forwards: number;
  discount: number;
  extra: number;
  paid: number;
  net: number;
  type: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: PaymentStatus;
  type: PaymentType;
  tuitionFee: number;
  otherCharges: number;
  forwards: number;
  extra: number;
  discount: number;
  paid: number;
  net: number;
  createdAt: string;
  updatedAt: string;
  student?: StudentFinancial;
}

export interface PaymentFormData {
  studentId: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: PaymentStatus;
  type: PaymentType;
  tuitionFee: number;
  otherCharges: number;
  forwards: number;
  extra: number;
  discount: number;
  paid: number;
  net: number;
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
