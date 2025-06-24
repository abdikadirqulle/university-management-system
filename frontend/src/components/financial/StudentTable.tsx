import React, { useState, useMemo } from "react";
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
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Payment } from "@/types/payment";
import { Button } from "../ui/button";
import { exportService } from "@/services/exportService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");

  // Extract unique departments and semesters for filter options
  const departments = useMemo(() => {
    const depts = new Set<string>();
    students.forEach((student) => {
      if (student.department?.name) {
        depts.add(student.department.name);
      }
    });
    return Array.from(depts).sort();
  }, [students]);

  const semesters = useMemo(() => {
    const sems = new Set<string>();
    students.forEach((student) => {
      if (student.semester) {
        sems.add(student.semester);
      }
    });
    return Array.from(sems).sort();
  }, [students]);

  // Filter students based on all criteria
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search term filter
      const matchesSearch =
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.department?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && student.isActive) ||
        (statusFilter === "inactive" && !student.isActive);

      // Department filter
      const matchesDepartment =
        departmentFilter === "all" ||
        student.department?.name === departmentFilter;

      // Semester filter
      const matchesSemester =
        semesterFilter === "all" || student.semester === semesterFilter;

      // Payment status filter
      const studentAccount = student.studentAccount?.[0];
      let matchesPayment = true;

      if (paymentFilter !== "all" && studentAccount) {
        const balance = getNetAmount(student);

        switch (paymentFilter) {
          case "paid":
            matchesPayment = balance <= 0;
            break;
          case "partial":
            matchesPayment = studentAccount.paidAmount > 0 && balance > 0;
            break;
          case "unpaid":
            matchesPayment = studentAccount.paidAmount <= 0 && balance > 0;
            break;
          default:
            matchesPayment = true;
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDepartment &&
        matchesSemester &&
        matchesPayment
      );
    });
  }, [
    students,
    searchTerm,
    statusFilter,
    departmentFilter,
    semesterFilter,
    paymentFilter,
  ]);

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
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select> */}

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
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
                    <Badge variant="outline">
                      {student.studentAccount?.[0]?.paidType || "N/A"}
                    </Badge>
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
