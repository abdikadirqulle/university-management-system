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

interface FinancialReportResponse {
  success: boolean;
  data: {
    totalPayment: number;
    totalPaid: number;
    incomeExpected: number;
    accruedIncome: number;
    deferredIncome: number;
    monthlyPayments: {
      month: string;
      amount: number;
    }[];
    paymentsByType: {
      type: string;
      amount: number;
    }[];
    paymentStatus: {
      status: string;
      count: number;
      amount: number;
    }[];
  };
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

interface PaymentFilterParams {
  startDate?: string;
  endDate?: string;
  paymentType?: string;
  status?: string;
  studentId?: string;
}

const paymentService = {
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
    const response = await api.get<PaymentsResponse>(
      `/payments/student/${studentId}`,
    );
    if (!response.data.success) {
      throw new Error("Failed to fetch student payments");
    }
    return response.data.payments;
  },

  createPayment: async (paymentData: PaymentFormData): Promise<Payment> => {
    const response = await api.post<Payment>("/payments", paymentData);
    return response.data;
  },

  updatePayment: async (
    id: string,
    paymentData: Partial<PaymentFormData>,
  ): Promise<Payment> => {
    const response = await api.put<Payment>(`/payments/${id}`, paymentData);
    return response.data;
  },

  deletePayment: async (id: string): Promise<void> => {
    const response = await api.delete(`/payments/${id}`);
    if (!response.data.success) {
      throw new Error("Failed to delete payment");
    }
  },

  getPaymentStatistics: async () => {
    const response = await api.get<PaymentStatisticsResponse>(
      "/payments/statistics",
    );
    if (!response.data.success) {
      throw new Error("Failed to fetch payment statistics");
    }
    return response.data.statistics;
  },

  getFinancialReport: async (filters?: PaymentFilterParams) => {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.paymentType)
      queryParams.append("paymentType", filters.paymentType);
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.studentId) queryParams.append("studentId", filters.studentId);

    const url = `/financial-reports?${queryParams.toString()}`;
    const response = await api.get<FinancialReportResponse>(url);

    if (!response.data.success) {
      throw new Error("Failed to fetch financial report");
    }
    return response.data.data;
  },
};

export { paymentService };
