import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Loader2, Pencil, PrinterIcon, Trash2, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Payment, PaymentFormData, PaymentType } from "@/types/payment";
import { Student } from "@/types/student";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePaymentStore } from "@/store/usePaymentStore";
import { exportService } from "@/services/exportService";
import { useStudentStore } from "@/store/useStudentStore";

// Form schema
const formSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentDate: z.date({
    required_error: "Payment date is required",
  }),

  type: z.string().min(1, "Payment type is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

// Payment methods

// Paid types
const PAID_TYPES = [
  { value: "Per Month", label: "Per Month" },
  { value: "Per Semester", label: "Per Semester" },
  { value: "Per Year", label: "Per Year" },
  { value: "One Time", label: "One Time" },
];

interface PaymentFormProps {
  payment?: Payment;
  selectedStudent: Student | null;
  students: Student[];
  onSubmit: (data: PaymentFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  payment,
  selectedStudent,
  students,
  onSubmit,
  isLoading,
  onCancel,
}) => {
  // State for student search and selected student
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [studentTransactions, setStudentTransactions] = useState(
    selectedStudent?.payments || [],
  );
  const [isPrinting, setIsPrinting] = useState(false);

  // New state for student status, paid type, and WhatsApp
  const [studentStatus, setStudentStatus] = useState(
    selectedStudent?.isActive ? "active" : "inactive",
  );
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);

  const [paidType, setPaidType] = useState(
    selectedStudent?.studentAccount?.[0]?.paidType || "Per Month",
  );
  const [paidTypeLoading, setPaidTypeLoading] = useState(false);
  const [paidTypeSuccess, setPaidTypeSuccess] = useState(false);

  const { deletePayment, fetchPayments } = usePaymentStore();
  const { toggleStudentActivation, updateStudentAccount } = useStudentStore();

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      paymentDate: payment?.paymentDate
        ? new Date(payment.paymentDate)
        : new Date(),
      type: "",
      paymentMethod: "",
    },
  });

  // Filter students when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(term) ||
        student.studentId.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term),
    );

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // Fetch data on component mount
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
        fetchPayments();
        toast.success("Payment deleted successfully");
      } catch (error) {
        console.error("Delete payment error:", error);
        toast.error("Failed to delete payment");
      }
      setIsDeleteDialogOpen(false);
      setSelectedPayment(null);
    }
  };

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      // Ensure all required fields are included
      const paymentData: PaymentFormData = {
        amount: values.amount,
        paymentDate: format(values.paymentDate, "yyyy-MM-dd"),
        type: values.type as PaymentType,
        paymentMethod: values.paymentMethod,
        studentId: selectedStudent?.studentId,
        // dueDate: format(values.dueDate, "yyyy-MM-dd"),
        // status: values.status as PaymentStatus,
        tuitionFee: selectedStudent?.studentAccount[0]?.tuitionFee || 0,
        discount: selectedStudent?.studentAccount[0]?.discount || 0,
        paid: selectedStudent?.studentAccount[0]?.paidAmount || 0,
        net: selectedStudent?.studentAccount[0]?.netAmount || 0,
      };

      onSubmit(paymentData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit payment form");
    }
  };

  const handlePrintTransaction = async () => {
    if (!selectedStudent?.studentId) {
      toast.error("No student selected");
      return;
    }
    setIsPrinting(true);
    try {
      await exportService.exportStudentTransactionPDF(
        selectedStudent.studentId,
      );
      toast.success("Transaction PDF exported");
    } catch (err) {
      toast.error("Failed to export transaction PDF");
    } finally {
      setIsPrinting(false);
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedStudent) return;

    setStatusLoading(true);
    setStatusSuccess(false);

    try {
      await toggleStudentActivation(selectedStudent.id);
      setStudentStatus(studentStatus === "active" ? "inactive" : "active");
      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 2000);
    } catch (error) {
      toast.error("Failed to update student status");
      console.error("Error updating student status:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  console.log("paidType", paidType);
  // Handle paid type change
  const handlePaidTypeChange = async () => {
    if (!selectedStudent) return;

    setPaidTypeLoading(true);
    setPaidTypeSuccess(false);

    try {
      await updateStudentAccount(selectedStudent.id, paidType);
      setPaidTypeSuccess(true);
      setTimeout(() => setPaidTypeSuccess(false), 2000);
    } catch (error) {
      toast.error("Failed to update payment type");
      console.error("Error updating payment type:", error);
    } finally {
      setPaidTypeLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card className="mb-4 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">PERSONAL INFORMATION</h3>
              <Badge variant="outline" className="text-xs px-2 py-1">
                Batch:
                <span className="uppercase">
                  {selectedStudent?.department?.batch || "N/A"}
                </span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-medium">{selectedStudent?.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{selectedStudent?.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student Status</p>
                <div className="flex items-center mt-1 gap-2">
                  <Select
                    value={studentStatus}
                    onValueChange={setStudentStatus}
                  >
                    <SelectTrigger className="">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handleStatusChange}
                    disabled={statusLoading}
                  >
                    {statusLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : statusSuccess ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Type</p>
                <div className="flex items-center mt-1 gap-2">
                  <Select value={paidType} onValueChange={setPaidType}>
                    <SelectTrigger className="">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAID_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handlePaidTypeChange}
                    disabled={paidTypeLoading}
                  >
                    {paidTypeLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : paidTypeSuccess ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* <div>
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <div className="flex items-center mt-1 gap-2">
                  <Input
                    value={whatsApp}
                    onChange={(e) => setWhatsApp(e.target.value)}
                    className=""
                  />
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handleWhatsAppChange}
                    disabled={whatsAppLoading}
                  >
                    {whatsAppLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : whatsAppSuccess ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div> */}
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium uppercase">
                  {selectedStudent?.department?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faculty</p>
                <p className="font-medium uppercase">
                  {selectedStudent?.faculty?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Semester</p>
                <p className="font-medium">{selectedStudent?.semester}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* )} */}

        {/* Tuition Fee Section */}
        <Card className="mb-4 border-primary/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-6 ">
              {/* Tuition Fee */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  TUITION FEE
                </p>
                <p className="font-semibold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(
                    selectedStudent?.studentAccount[0]?.tuitionFee || 0,
                  )}
                </p>
              </div>
              <p>-</p>

              {/* Discount */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">DISCOUNT</p>
                <p className="font-semibold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(selectedStudent?.studentAccount[0]?.discount || 0)}
                </p>
              </div>
              <p>-</p>
              {/* Paid */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">PAID</p>
                <p className="font-semibold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(
                    selectedStudent?.studentAccount[0]?.paidAmount || 0,
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">BALANCE</p>
                <p className="font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(
                    (selectedStudent?.studentAccount[0]?.tuitionFee || 0) -
                      (selectedStudent?.studentAccount[0]?.discount || 0) -
                      (selectedStudent?.studentAccount[0]?.paidAmount || 0),
                  )}
                </p>
              </div>
            </div>

            {/* Total Calculation */}
          </CardContent>
        </Card>

        <Tabs defaultValue="payment" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment">Payment Information</TabsTrigger>
            <TabsTrigger value="transaction">
              Transaction Information
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment" className="mt-4">
            {/* Payment Information Section */}
            <Card className="mb-4 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  PAYMENT INFORMATION
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Payment Type */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PaymentType.TUITION}>
                              Tuition Fee
                            </SelectItem>
                            <SelectItem value={PaymentType.ID_CARD}>
                              ID Card
                            </SelectItem>
                            <SelectItem value={PaymentType.CERTIFICATE}>
                              Certificate
                            </SelectItem>
                            <SelectItem value={PaymentType.GRADUATION}>
                              Graduation
                            </SelectItem>
                            <SelectItem value={PaymentType.HOUSING}>
                              Housing
                            </SelectItem>
                            <SelectItem value={PaymentType.ADMINISTRATIVE}>
                              Administrative
                            </SelectItem>
                            <SelectItem value={PaymentType.DEPOSITS}>
                              Deposits
                            </SelectItem>
                            <SelectItem value={PaymentType.OTHER}>
                              Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Amount */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Payment Method */}
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="bank_transfer">
                              Bank Transfer
                            </SelectItem>
                            <SelectItem value="mobile_money">
                              Mobile Money
                            </SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Payment Date */}
                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Month</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MMMM, yyyy")
                                ) : (
                                  <span>Select month</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transaction" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Transaction History
                  </h3>
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={isPrinting || !selectedStudent?.studentId}
                      onClick={handlePrintTransaction}
                    >
                      {isPrinting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PrinterIcon className="h-4 w-4" />
                      )}
                      Print
                    </Button>
                  </div>
                </div>

                {studentTransactions && studentTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Academic Year</TableHead>
                          <TableHead>Paid Amount</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentTransactions?.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {transaction.createdAt.substring(0, 4)}
                            </TableCell>
                            <TableCell>
                              ${transaction.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {transaction.type}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              {format(
                                new Date(transaction.createdAt),
                                "MMM dd, yyyy hh:mm a",
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  //   onClick={() => handleEditPayment(transaction)}
                                  title="Edit transaction"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDeletePayment(transaction)
                                  }
                                  title="Delete transaction"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No transaction history found for this student.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              payment record for {selectedStudent?.fullName || "this student"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
              }}
            >
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
    </Form>
  );
};

export default PaymentForm;
