import { api } from "./api";
import { Payment, PaymentFormData } from "@/types/payment";

interface PaymentResponse {
  success: boolean;
  message?: string;
  payment: Payment;
}

interface PaymentsResponse {
  success: boolean;
  count: number;
  payments: Payment[];
}

interface PaymentStatisticsResponse {
  success: boolean;
  statistics: {
    totalPayments: number;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    paymentsByType: {
      type: string;
      _count: { id: number };
      _sum: { amount: number };
    }[];
  };
}

export const paymentService = {
  getAllPayments: async (): Promise<Payment[]> => {
    const response = await api.get<PaymentsResponse>("/payments");
    if (!response.data.success) {
      throw new Error("Failed to fetch payments");
    }
    return response.data.payments;
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await api.get<PaymentResponse>(`/payments/${id}`);
    if (!response.data.success) {
      throw new Error("Failed to fetch payment");
    }
    return response.data.payment;
  },

  getPaymentsByStudentId: async (studentId: string): Promise<Payment[]> => {
    const response = await api.get<PaymentsResponse>(`/payments/student/${studentId}`);
    if (!response.data.success) {
      throw new Error("Failed to fetch student payments");
    }
    return response.data.payments;
  },

  createPayment: async (paymentData: PaymentFormData): Promise<Payment> => {
    const response = await api.post<PaymentResponse>("/payments", paymentData);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create payment");
    }
    return response.data.payment;
  },

  updatePayment: async (id: string, paymentData: Partial<PaymentFormData>): Promise<Payment> => {
    const response = await api.put<PaymentResponse>(`/payments/${id}`, paymentData);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update payment");
    }
    return response.data.payment;
  },

  deletePayment: async (id: string): Promise<void> => {
    const response = await api.delete(`/payments/${id}`);
    if (!response.data.success) {
      throw new Error("Failed to delete payment");
    }
  },

  getPaymentStatistics: async () => {
    const response = await api.get<PaymentStatisticsResponse>("/payments/statistics");
    if (!response.data.success) {
      throw new Error("Failed to fetch payment statistics");
    }
    return response.data.statistics;
  },
};
