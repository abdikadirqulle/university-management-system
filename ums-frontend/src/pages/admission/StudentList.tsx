import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageHeader from "@/components/PageHeader";
import { useStudentStore } from "@/store/useStudentStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Student } from "@/types/student";
import { toast } from "sonner";
import StudentDetailDialog from "@/components/admission/StudentDetailDialog";
import {
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Pencil,
  UserPlus,
  X,
  UploadCloud,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define available semesters for filtering
const semesters = [
  "Fall 2022",
  "Spring 2023",
  "Summer 2023",
  "Fall 2023",
  "Spring 2024",
];

// Define available sessions for filtering
const sessions = ["2021-2022", "2022-2023", "2023-2024", "2024-2025"];

const StudentManager = () => {
  useAuthGuard(["admission"]);

  const { students, isLoading, fetchStudents, updateStudent } =
    useStudentStore();

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [idFilter, setIdFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // State for student detail dialog
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle opening view dialog
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  // Handle opening edit dialog
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  // Handle saving edited student
  const handleSaveStudent = (updatedStudent: Student) => {
    updateStudent(updatedStudent.id, updatedStudent);
    toast.success("Student information updated successfully");
  };

  // Filter students based on search term and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesId = idFilter ? student.studentId.includes(idFilter) : true;

    const matchesSemester = semesterFilter
      ? student.semester === semesterFilter
      : true;

    const matchesStatus = statusFilter ? student.status === statusFilter : true;

    return matchesSearch && matchesId && matchesSemester && matchesStatus;
  });

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setIdFilter("");
    setSemesterFilter("");
    setStatusFilter("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Student Records</CardTitle>
              <CardDescription>
                View and manage all enrolled students
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchStudents();
                  clearFilters();
                  toast.success("Student data refreshed");
                }}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" /> Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" /> Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and filters section */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="mb-2 block">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, or department"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-48">
                <Label htmlFor="semester-filter" className="mb-2 block">
                  Semester
                </Label>
                <Select
                  value={semesterFilter}
                  onValueChange={setSemesterFilter}
                >
                  <SelectTrigger id="semester-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {semesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-48">
                <Label htmlFor="status-filter" className="mb-2 block">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-48">
                <Label htmlFor="id-filter" className="mb-2 block">
                  Student ID
                </Label>
                <Input
                  id="id-filter"
                  placeholder="Filter by ID"
                  value={idFilter}
                  onChange={(e) => setIdFilter(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Department
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Semester
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Session
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading student data...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No students found matching your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.department}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.semester}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.session}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            student.status === "active"
                              ? "bg-green-500"
                              : student.status === "graduated"
                                ? "bg-blue-500"
                                : student.status === "suspended"
                                  ? "bg-gray-500"
                                  : "bg-red-500"
                          }`}
                        >
                          {student.status}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleViewStudent(student)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditStudent(student)}
                            >
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>
        </CardFooter>
      </Card>

      {/* View Dialog */}
      <StudentDetailDialog
        student={selectedStudent}
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        onSave={() => {}}
        viewOnly={true}
      />

      {/* Edit Dialog */}
      <StudentDetailDialog
        student={selectedStudent}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveStudent}
      />
    </div>
  );
};

export default StudentManager;
