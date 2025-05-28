import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/types/student";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Payment } from "@/types/payment";

interface StudentTableProps {
  students: Student[];
  payments: Payment[];
  isLoading: boolean;
  onSelectStudent: (student: Student) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  payments,
  isLoading,
  onSelectStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Show student department and batch information
  console.log("Student batches:", students.map(s =>  s).filter(Boolean));
  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.department?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get payment type for a student
  const getPaymentType = (studentId: string) => {
    const studentPayments = payments.filter(p => p.studentId === studentId);
    if (studentPayments.length === 0) return "Not set";
    
    // Get the most recent payment type
    const latestPayment = studentPayments.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
    
    return latestPayment.type.charAt(0).toUpperCase() + latestPayment.type.slice(1);
  };

  // Get total paid amount for a student
  const getTotalPaid = (studentId: string) => {
    const studentPayments = payments.filter(p => p.studentId === studentId);
    if (studentPayments.length === 0) return 0;
    
    return studentPayments.reduce((total, payment) => total + payment.paid, 0);
  };

  // Get net amount for a student
  const getNetAmount = (studentId: string) => {
    const studentPayments = payments.filter(p => p.studentId === studentId);
    if (studentPayments.length === 0) return 0;
    
    return studentPayments.reduce((total, payment) => total + payment.net, 0);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[250px]" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Payment Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, email, or department..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Payment Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow 
                  key={student.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectStudent(student)}
                >
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>
                    <div className="font-medium">{student.fullName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="uppercase">{student.faculty?.name || 'N/A'}</div>
                  </TableCell>
                  <TableCell> 
                    <div className="uppercase">{student.department?.name || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="uppercase">{student.department?.batch || 'N/A'}</div>
                  </TableCell>
                  <TableCell>{student.semester || 'N/A'}</TableCell>
                  <TableCell>{student.session || 'N/A'}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(getTotalPaid(student.studentId))}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(getNetAmount(student.studentId))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getPaymentType(student.studentId)}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StudentTable;
