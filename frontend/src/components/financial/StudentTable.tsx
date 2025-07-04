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
import { Search, FileTextIcon, Loader2 } from "lucide-react";
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
import { toast } from "sonner";

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
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  // Extract unique departments, faculties, and semesters for filter options
  const departments = useMemo(() => {
    const depts = new Set<string>();
    students.forEach((student) => {
      if (student.department?.name) {
        depts.add(student.department.name);
      }
    });
    return Array.from(depts).sort();
  }, [students]);

  const faculties = useMemo(() => {
    const facs = new Set<string>();
    students.forEach((student) => {
      if (student.faculty?.name) {
        facs.add(student.faculty.name);
      }
    });
    return Array.from(facs).sort();
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

      // Faculty filter
      const matchesFaculty =
        facultyFilter === "all" || student.faculty?.name === facultyFilter;

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
        matchesFaculty &&
        matchesSemester &&
        matchesPayment
      );
    });
  }, [
    students,
    searchTerm,
    statusFilter,
    departmentFilter,
    facultyFilter,
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

  // Get net amount for a student
  const getNetAmount = (student: Student) => {
    const studentAccount = student.studentAccount?.[0];
    if (studentAccount) {
      const tuition = studentAccount.tuitionFee || 0;
      const paid = studentAccount.paidAmount || 0;
      const discount = studentAccount.discount || 0;
      const scholarship =
        ((studentAccount.scholarship || 0) / 100) *
        (studentAccount.tuitionFee || 0);
      const forwarded = studentAccount.forwarded || 0;
      return tuition - paid - discount + forwarded - scholarship;
    }
    return 0;
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
                <TableHead>Forwarded</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>TF Type</TableHead>
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

  const handleExportPaymentsExcel = async () => {
    try {
      setIsExporting(true);
      await exportService.exportPaymentsExcel();
      toast.success("Payments exported successfully");
    } catch (error) {
      console.error("Error exporting payments Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

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

          <Select value={facultyFilter} onValueChange={setFacultyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Faculty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculties</SelectItem>
              {faculties.map((faculty) => (
                <SelectItem key={faculty} value={faculty}>
                  {faculty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
            onClick={() => handleExportPaymentsExcel()}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <>
                <FileTextIcon className="h-4 w-4 mr-2" />
                Export Excel
              </>
            )}
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
                  <TableCell className="font-medium  text-nowrap">
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
