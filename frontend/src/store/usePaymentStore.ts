import { create } from "zustand";
import { toast } from "sonner";
import { Payment, PaymentFormData, PaymentStatistics } from "@/types/payment";
import { paymentService } from "@/services/paymentService";

interface FinancialReport {
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
}

interface PaymentStore {
  // State
  payments: Payment[];
  selectedPayment: Payment | null;
  statistics: PaymentStatistics | null;
  financialReport: FinancialReport | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPayments: () => Promise<void>;
  fetchPaymentById: (id: string) => Promise<void>;
  fetchPaymentsByStudentId: (studentId: string) => Promise<void>;
  fetchPaymentStatistics: () => Promise<void>;
  fetchFinancialReport: (filters?: {
    startDate?: string;
    endDate?: string;
    paymentType?: string;
    status?: string;
    studentId?: string;
  }) => Promise<void>;
  createPayment: (paymentData: PaymentFormData) => Promise<void>;
  updatePayment: (
    id: string,
    paymentData: Partial<PaymentFormData>,
  ) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  setSelectedPayment: (payment: Payment | null) => void;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  // Initial state
  payments: [],
  selectedPayment: null,
  statistics: null,
  financialReport: null,
  isLoading: false,
  error: null,

  // Actions
  fetchPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const payments = await paymentService.getAllPayments();
      set({ payments, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch payments";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchPaymentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const payment = await paymentService.getPaymentById(id);
      set({ selectedPayment: payment, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch payment";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchPaymentsByStudentId: async (studentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const payments = await paymentService.getPaymentsByStudentId(studentId);
      set({ payments, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch student payments";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchPaymentStatistics: async () => {
    set({ isLoading: true, error: null });
    try {
      const statistics = await paymentService.getPaymentStatistics();
      set({ statistics, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch payment statistics";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchFinancialReport: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const report = await paymentService.getFinancialReport(filters);
      set({ financialReport: report, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch financial report";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  createPayment: async (paymentData: PaymentFormData) => {
    try {
      set({ isLoading: true, error: null });
      if (paymentData.id) {
        // If id exists, update the payment instead
        await get().updatePayment(paymentData.id, paymentData);
      } else {
        // Create new payment
        const newPayment = await paymentService.createPayment(paymentData);
        set((state) => ({
          payments: [...state.payments, newPayment],
        }));
        toast.success("Payment created successfully");
      }
    } catch (error) {
      console.error("Create payment error:", error);
      set({ error: "Failed to create payment" });
      toast.error("Failed to create payment");
    } finally {
      set({ isLoading: false });
    }
  },

  updatePayment: async (id: string, paymentData: Partial<PaymentFormData>) => {
    try {
      set({ isLoading: true, error: null });
      const updatedPayment = await paymentService.updatePayment(
        id,
        paymentData,
      );
      set((state) => ({
        payments: state.payments.map((payment) =>
          payment.id === id ? updatedPayment : payment,
        ),
      }));
      toast.success("Payment updated successfully");
    } catch (error) {
      console.error("Update payment error:", error);
      set({ error: "Failed to update payment" });
      toast.error("Failed to update payment");
    } finally {
      set({ isLoading: false });
    }
  },

  deletePayment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await paymentService.deletePayment(id);
      set((state) => ({
        payments: state.payments.filter((payment) => payment.id !== id),
        isLoading: false,
      }));
      toast.success("Payment deleted successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete payment";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  setSelectedPayment: (payment: Payment | null) => {
    set({ selectedPayment: payment });
  },

  clearError: () => {
    set({ error: null });
  },
}));
