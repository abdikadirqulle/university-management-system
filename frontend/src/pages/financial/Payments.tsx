import React, { useState, useEffect } from "react";
import { toast } from "sonner";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { usePaymentStore } from "@/store/usePaymentStore";
import { useStudentStore } from "@/store/useStudentStore";
import { PaymentFormData } from "@/types/payment";
import { Student } from "@/types/student";
import PageHeader from "@/components/PageHeader";
import StudentTable from "@/components/financial/StudentTable";
import PaymentForm from "@/components/financial/PaymentForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";

const PaymentsPage = () => {
  useAuthGuard(["financial", "admin"]);

  // State for dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Get data from stores
  const {
    payments,
    isLoading,
    selectedPayment,
    fetchPayments,
    createPayment,
    setSelectedPayment,
    fetchPaymentStatistics,
  } = usePaymentStore();

  const { students, fetchStudents, toggleStudentActivation } =
    useStudentStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchPayments();
    fetchStudents();
    fetchPaymentStatistics();
  }, [fetchPayments, fetchStudents, fetchPaymentStatistics]);

  // Handle form submission
  const handleSubmitPayment = async (data: PaymentFormData) => {
    try {
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
    const studentPayments = payments.filter(
      (p) => p.studentId === student.studentId,
    );
    if (studentPayments.length > 0) {
      // Sort by date descending and get the most recent
      const latestPayment = studentPayments.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )[0];
      setSelectedPayment(latestPayment);
    } else {
      // No existing payment, create a new one
      setSelectedPayment(null);
    }

    setIsFormOpen(true);
  };

  // Handle student activation toggle
  const handleToggleActivation = async (student: Student) => {
    const action = student.isActive ? "deactivate" : "activate";
    if (
      window.confirm(`Are you sure you want to ${action} ${student.fullName}?`)
    ) {
      try {
        await toggleStudentActivation(student.id);
      } catch (error) {
        toast.error(`Failed to ${action} student`);
      }
    }
  };
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Student Payments"
        description="Manage student payments and financial records"
        action={{
          label: "Refresh",
          icon: RefreshCw,
          onClick: () => {
            fetchPayments();
            fetchStudents();
            fetchPaymentStatistics();
          },
        }}
      />

      {/* Students Table with Payment Information */}
      <StudentTable
        students={students}
        payments={payments}
        isLoading={isLoading}
        onSelectStudent={handleSelectStudent}
        onToggleActivation={handleToggleActivation}
      />

      {/* Payment Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPayment ? "Edit Payment" : "Create New Payment"}
            </DialogTitle>
          </DialogHeader>
          <PaymentForm
            selectedStudent={selectedStudent}
            students={students}
            isLoading={isLoading}
            payment={selectedPayment}
            onSubmit={handleSubmitPayment}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedPayment(null);
              setSelectedStudent(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;
