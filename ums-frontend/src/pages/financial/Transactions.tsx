import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { usePaymentStore } from "@/store/usePaymentStore";
import { Payment, PaymentStatus, PaymentType } from "@/types/payment";
import PageHeader from "@/components/PageHeader";
import PaymentTable from "@/components/financial/PaymentTable";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TransactionsPage = () => {
  useAuthGuard(["financial", "admin"]);
  
  // State for dialogs
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Get data from stores
  const { 
    payments, 
    isLoading, 
    selectedPayment,
    fetchPayments, 
    deletePayment, 
    setSelectedPayment,
  } = usePaymentStore();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);
  
  // Handle payment edit
  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    // Navigate to payments page to edit
    window.location.href = "/financial/payments";
    toast.info("Redirecting to payment edit page");
  };
  
  // Handle payment delete
  const handleDeletePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete payment
  const confirmDeletePayment = async () => {
    if (selectedPayment) {
      try {
        await deletePayment(selectedPayment.id);
        toast.success("Payment deleted successfully");
      } catch (error) {
        console.error("Delete payment error:", error);
        toast.error("Failed to delete payment");
      }
      setIsDeleteDialogOpen(false);
      setSelectedPayment(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Transaction History"
        description="View and manage all payment transactions"
      />

      {/* Payments Table */}
      <PaymentTable 
        payments={payments}
        isLoading={isLoading}
        onEdit={handleEditPayment}
        onDelete={handleDeletePayment}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the payment
              record for {selectedPayment?.student?.fullName || "this student"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setSelectedPayment(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePayment}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TransactionsPage;
