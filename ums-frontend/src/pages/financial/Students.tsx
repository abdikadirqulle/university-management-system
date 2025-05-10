import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye, CreditCard } from "lucide-react";
import { useStudentStore } from "@/store/useStudentStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import { Payment, PaymentStatus } from "@/types/payment";
import { format } from "date-fns";

const FinancialStudentsPage = () => {
  // Use auth guard to protect this page
  useAuthGuard(["financial", "admin"]);

  // State for search and dialogs
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);

  // Get data from stores
  const { students, isLoading: isStudentsLoading, fetchStudents } = useStudentStore();
  const { 
    payments, 
    isLoading: isPaymentsLoading, 
    fetchPaymentsByStudentId 
  } = usePaymentStore();

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.department?.name && 
        student.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // View student payment history
  const handleViewPaymentHistory = async (student: any) => {
    setSelectedStudent(student);
    await fetchPaymentsByStudentId(student.studentId);
    setIsPaymentHistoryOpen(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return <Badge className="bg-green-500">Paid</Badge>;
      case PaymentStatus.PENDING:
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case PaymentStatus.OVERDUE:
        return <Badge className="bg-red-500">Overdue</Badge>;
      case PaymentStatus.PARTIAL:
        return <Badge className="bg-blue-500">Partial</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Calculate total paid, pending, and overdue for a student
  const calculateStudentPaymentSummary = (studentId: string) => {
    const studentPayments = payments.filter(p => p.studentId === studentId);
    
    const total = studentPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const paid = studentPayments
      .filter(p => p.status === PaymentStatus.PAID)
      .reduce((sum, payment) => sum + payment.amount, 0);
    const pending = studentPayments
      .filter(p => p.status === PaymentStatus.PENDING)
      .reduce((sum, payment) => sum + payment.amount, 0);
    const overdue = studentPayments
      .filter(p => p.status === PaymentStatus.OVERDUE)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    return { total, paid, pending, overdue };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Financial Records"
        description="View and manage student financial information"
      />

      {/* Search */}
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name, ID, or department..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Financial Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isStudentsLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-6 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[100px]" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-6 w-[80px] ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>
                        <div className="font-medium">{student.fullName}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </TableCell>
                      <TableCell>{student.department?.name || "N/A"}</TableCell>
                      <TableCell>
                        {student.payments?.length > 0 ? (
                          student.payments.some(
                            (p: any) => p.status === PaymentStatus.OVERDUE
                          ) ? (
                            <Badge variant="destructive">Overdue</Badge>
                          ) : student.payments.some(
                            (p: any) => p.status === PaymentStatus.PENDING
                          ) ? (
                            <Badge variant="outline" className="bg-yellow-500 text-white">
                              Pending
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-500 text-white">
                              Paid
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline">No Records</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPaymentHistory(student)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Payment History
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Dialog */}
      <Dialog open={isPaymentHistoryOpen} onOpenChange={setIsPaymentHistoryOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              Payment History - {selectedStudent?.fullName} ({selectedStudent?.studentId})
            </DialogTitle>
            <DialogDescription>
              View all payment records for this student
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Total Payments</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {selectedStudent && (
                  <div className="text-2xl font-bold">
                    {formatCurrency(calculateStudentPaymentSummary(selectedStudent.studentId).total)}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Paid Amount</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {selectedStudent && (
                  <div className="text-2xl font-bold text-green-500">
                    {formatCurrency(calculateStudentPaymentSummary(selectedStudent.studentId).paid)}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Outstanding Amount</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {selectedStudent && (
                  <div className="text-2xl font-bold text-red-500">
                    {formatCurrency(
                      calculateStudentPaymentSummary(selectedStudent.studentId).pending +
                        calculateStudentPaymentSummary(selectedStudent.studentId).overdue
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPaymentsLoading ? (
                  Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-6 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[100px]" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No payment records found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="capitalize">{payment.type.toLowerCase()}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {format(new Date(payment.dueDate), "MMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setIsPaymentHistoryOpen(false)}
            >
              Close
            </Button>
            <Button className="ml-2">
              <CreditCard className="mr-2 h-4 w-4" />
              Add Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialStudentsPage;
