import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { CreditCard, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import PaymentForm from "@/components/financial/PaymentForm";
import PaymentTable from "@/components/financial/PaymentTable";
import { usePaymentStore } from "@/store/usePaymentStore";
import { useStudentStore } from "@/store/useStudentStore";
import { Payment, PaymentFormData, PaymentStatus, PaymentType } from "@/types/payment";



const PaymentsPage = () => {
  useAuthGuard(["financial", "admin"]);
  
  // State for dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Get data from stores
  const { 
    payments, 
    isLoading, 
    selectedPayment,
    fetchPayments, 
    createPayment, 
    updatePayment, 
    deletePayment, 
    setSelectedPayment,
    statistics,
    fetchPaymentStatistics
  } = usePaymentStore();
  
  const { students, fetchStudents } = useStudentStore();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchPayments();
    fetchStudents();
    fetchPaymentStatistics();
  }, [fetchPayments, fetchStudents, fetchPaymentStatistics]);
  
  // Handle form submission
  const handleSubmitPayment = async (data: PaymentFormData) => {
    try {
      if (selectedPayment) {
        await updatePayment(selectedPayment.id, data);
        toast.success("Payment updated successfully");
      } else {
        await createPayment(data);
        toast.success("Payment created successfully");
      }
      setIsFormOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error("Payment submission error:", error);
      toast.error("Failed to save payment");
    }
  };
  
  // Handle payment edit
  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsFormOpen(true);
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
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Payments Management"
        description="Manage student payments, invoices, and financial records"
        action={{
          label: "Add Payment",
          icon: Plus,
          onClick: () => {
            setSelectedPayment(null);
            setIsFormOpen(true);
          },
        }}
      />



      {/* Payments Table */}
      <PaymentTable 
        payments={payments}
        isLoading={isLoading}
        onEdit={handleEditPayment}
        onDelete={handleDeletePayment}
      />

      {/* Payment Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedPayment ? "Edit Payment" : "Add New Payment"}</DialogTitle>
            <DialogDescription>
              {selectedPayment 
                ? "Update the payment details below." 
                : "Enter the payment details below to create a new payment record."}
            </DialogDescription>
          </DialogHeader>

          <PaymentForm
            payment={selectedPayment || undefined}
            students={students}
            onSubmit={handleSubmitPayment}
            isLoading={isLoading}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedPayment(null);
            }}
          />
        </DialogContent>
      </Dialog>

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

export default PaymentsPage;
