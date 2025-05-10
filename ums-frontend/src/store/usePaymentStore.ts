import { create } from "zustand";
import { toast } from "sonner";
import { Payment, PaymentFormData, PaymentStatistics } from "@/types/payment";
import { paymentService } from "@/services/paymentService";

interface PaymentStore {
  // State
  payments: Payment[];
  selectedPayment: Payment | null;
  statistics: PaymentStatistics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPayments: () => Promise<void>;
  fetchPaymentById: (id: string) => Promise<void>;
  fetchPaymentsByStudentId: (studentId: string) => Promise<void>;
  fetchPaymentStatistics: () => Promise<void>;
  createPayment: (paymentData: PaymentFormData) => Promise<void>;
  updatePayment: (id: string, paymentData: Partial<PaymentFormData>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  setSelectedPayment: (payment: Payment | null) => void;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  // Initial state
  payments: [],
  selectedPayment: null,
  statistics: null,
  isLoading: false,
  error: null,

  // Actions
  fetchPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const payments = await paymentService.getAllPayments();
      set({ payments, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch payments";
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
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch payment";
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
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch student payments";
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
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch payment statistics";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  createPayment: async (paymentData: PaymentFormData) => {
    set({ isLoading: true, error: null });
    try {
      const newPayment = await paymentService.createPayment(paymentData);
      set((state) => ({
        payments: [newPayment, ...state.payments],
        isLoading: false,
      }));
      toast.success("Payment created successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create payment";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  updatePayment: async (id: string, paymentData: Partial<PaymentFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPayment = await paymentService.updatePayment(id, paymentData);
      set((state) => ({
        payments: state.payments.map((payment) =>
          payment.id === id ? updatedPayment : payment
        ),
        selectedPayment: updatedPayment,
        isLoading: false,
      }));
      toast.success("Payment updated successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update payment";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to delete payment";
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
