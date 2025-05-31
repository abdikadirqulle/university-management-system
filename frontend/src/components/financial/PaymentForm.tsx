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
import { Loader2, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Payment, PaymentFormData, PaymentStatus, PaymentType } from "@/types/payment";
import { Student } from "@/types/student";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "../ui/badge";

// Form schema
const formSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentDate: z.date({
    required_error: "Payment date is required",
  }),
 
  type: z.string().min(1, "Payment type is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
 
});

interface PaymentFormProps {
  payment?: Payment;
  selectedStudent: Student | null,  // Change from Student[] | null to Student | null
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

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      paymentDate: payment?.paymentDate ? new Date(payment.paymentDate) : new Date(),
      type: "",
      paymentMethod:"",
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
        student.email.toLowerCase().includes(term)
    );
    
    setFilteredStudents(filtered);
  }, [searchTerm, students]);
  


  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form values:", values);
    try {
      // Calculate net amount if not set
      
      
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Student Search Section (only shown when no student is selected) */}
      

        {/* Student Personal Information Section */}
        {/* {selectedStudent && ( */}
          <Card className="mb-4 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">PERSONAL INFORMATION</h3>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  Batch:<span className="uppercase">
                  {selectedStudent?.department?.batch || 'N/A'}
                  </span>
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student Status</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="bg-primary/10">Active</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-medium">{selectedStudent?.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedStudent?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{selectedStudent?.phoneNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium uppercase">{selectedStudent?.department?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Faculty</p>
                  <p className="font-medium uppercase">{selectedStudent?.faculty?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Semester</p>
                  <p className="font-medium">{selectedStudent?.semester}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Session</p>
                  <p className="font-medium">{selectedStudent?.session}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        {/* )} */}
      
              
        {/* Payment Information Section - Only shown when a student is selected */}
        {/* {selectedStudent && ( */}
          <>
            {/* Tuition Fee Section */}
            <Card className="mb-4 border-primary/20">
              <CardContent className="pt-6">                
                <div className="grid grid-cols-1 md:grid-cols-6 ">
                  {/* Tuition Fee */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">TUITION FEE</p>
                    <p className="font-semibold">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                        .format(selectedStudent?.studentAccount[0]?.tuitionFee || 0)}
                    </p>
                  </div>
                  <p>-</p>
              
                  {/* Discount */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">DISCOUNT</p>
                    <p className="font-semibold">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                        .format(selectedStudent?.studentAccount[0]?.discount || 0)}
                    </p>
                  </div>
                  <p>-</p>
              {/* Paid */}
                  <div>
                      <p className="text-sm text-muted-foreground mb-1">PAID</p>
                      <p className="font-semibold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                          .format(selectedStudent?.studentAccount[0]?.paidAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">NET</p>
                      <p className="font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                          .format(
                            (selectedStudent?.studentAccount[0]?.tuitionFee || 0) - 
                            (selectedStudent?.studentAccount[0]?.discount || 0) -
                            (selectedStudent?.studentAccount[0]?.paidAmount || 0)
                          )}
                      </p>
                    </div>
                </div>
                
                {/* Total Calculation */}
             
              </CardContent>
            </Card>
            
            {/* Payment Information Section */}
            <Card className="mb-4 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">PAYMENT INFORMATION</h3>
                
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
                            <SelectItem value={PaymentType.TUITION}>Tuition Fee</SelectItem>
                            <SelectItem value={PaymentType.ACCOMMODATION}>Accommodation</SelectItem>
                            <SelectItem value={PaymentType.LIBRARY}>Library</SelectItem>
                            <SelectItem value={PaymentType.OTHER}>Other</SelectItem>
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
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="mobile_money">Mobile Money</SelectItem>
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
                                  !field.value && "text-muted-foreground"
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
                                date > new Date() || date < new Date("1900-01-01")
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
          </>
        {/* )} */}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
           Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentForm;
