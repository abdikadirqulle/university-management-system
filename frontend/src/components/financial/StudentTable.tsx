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
import {
  PrinterIcon,
  Search,
  FileTextIcon,
  Power,
  PowerOff,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Payment } from "@/types/payment";
import { Button } from "../ui/button";
import { exportService } from "@/services/exportService";

interface StudentTableProps {
  students: Student[];
  payments: Payment[];
  isLoading: boolean;
  onSelectStudent: (student: Student) => void;
  onToggleActivation?: (student: Student) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  payments,
  isLoading,
  onSelectStudent,
  onToggleActivation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.department?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get payment type for a student
  const getPaymentType = (student: Student) => {
    const studentPayments = payments.filter(
      (p) => p.studentId === student.studentId,
    );
    if (studentPayments.length === 0) return "Not set";

    // Get the most recent payment type
    const latestPayment = studentPayments.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )[0];

    return (
      latestPayment.type.charAt(0).toUpperCase() + latestPayment.type.slice(1)
    );
  };

  // Get net amount for a student
  const getNetAmount = (student: Student) => {
    const studentAccount = student.studentAccount?.[0];
    if (studentAccount) {
      const tuition = studentAccount.tuitionFee || 0;
      const paid = studentAccount.paidAmount || 0;
      const discount = studentAccount.discount || 0;
      return tuition - paid - discount;
    }
    return 0;
  };

  const handleToggleActivation = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    if (onToggleActivation) {
      onToggleActivation(student);
    }
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
                <TableHead>Sem</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>TF Type</TableHead>
                {onToggleActivation && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                  {onToggleActivation && (
                    <TableCell>
                      <Skeleton className="h-6 w-[80px]" />
                    </TableCell>
                  )}
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
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-[300px]"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportService.exportStudentsExcel()}
          >
            <FileTextIcon className="h-4 w-4 mr-2" />
            Excel Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Sem</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Forwarded</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>TF Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={onToggleActivation ? 12 : 11}
                  className="text-center py-6 text-muted-foreground"
                >
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
                    <div className="font-medium text-nowrap">
                      {student.fullName}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="uppercase  font-medium">
                      {student.department?.batch || "N/A"}
                    </div>
                  </TableCell>

                  <TableCell>{student.semester || "N/A"}</TableCell>
                  <TableCell className="uppercase">
                    {student.session || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(
                      student.studentAccount?.[0]?.forwarded || 0,
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(student.studentAccount?.[0]?.discount || 0)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(
                      student.studentAccount?.[0]?.paidAmount || 0,
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(getNetAmount(student))}
                  </TableCell>
                  <TableCell className="font-medium uppercase text-nowrap">
                    <Badge variant="outline">{getPaymentType(student)}</Badge>
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
