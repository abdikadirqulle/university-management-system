import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { usePaymentStore } from "@/store/usePaymentStore";
import { useStudentStore } from "@/store/useStudentStore";
import { Payment, PaymentFormData, PaymentStatus, PaymentType } from "@/types/payment";
import { Student } from "@/types/student";
import PageHeader from "@/components/PageHeader";
import StudentTable from "@/components/financial/StudentTable";
import PaymentForm from "@/components/financial/PaymentForm";

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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";



const PaymentsPage = () => {
  useAuthGuard(["financial", "admin"]);
  
  // State for dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  
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
      // if (selectedPayment) {
      //   await updatePayment(selectedPayment.id, data);
      //   toast.success("Payment updated successfully");
      // } else {
      //   await createPayment(data);
      //   toast.success("Payment created successfully");
      // }
      await createPayment(data);
      toast.success("Payment created successfully");
      setIsFormOpen(false);
      setSelectedPayment(null);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Payment submission error:", error);
      toast.error("Failed to save payment");
    }
  };
  
  // Handle student selection
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    
    // Find the most recent payment for this student
    const studentPayments = payments.filter(p => p.studentId === student.studentId);
    if (studentPayments.length > 0) {
      // Sort by date descending and get the most recent
      const latestPayment = studentPayments.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      setSelectedPayment(latestPayment);
    } else {
      // No existing payment, create a new one
      setSelectedPayment(null);
    }
    
    setIsFormOpen(true);
  };
  
  // Handle payment edit
  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    // Find the student for this payment
    const student = students.find(s => s.studentId === payment.studentId);
    if (student) {
      setSelectedStudent(student);
    }
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
        title="Student Payments"
        description="Manage student payments, invoices, and financial records"
        // action={{
        //   label: "Add Payment",
        //   icon: Plus,
        //   onClick: () => {
        //     setSelectedPayment(null);
        //     setSelectedStudent(null);
        //     setIsFormOpen(true);
        //   },
        // }}
      />

      {/* Students Table with Payment Information */}
      <StudentTable 
        students={students}
        payments={payments}
        isLoading={isLoading}
        onSelectStudent={handleSelectStudent}
      />

      {/* Payment Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
            selectedStudent={selectedStudent}
            students={students}
            onSubmit={handleSubmitPayment}
            isLoading={isLoading}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedPayment(null);
              // setSelectedStudent(null);
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
