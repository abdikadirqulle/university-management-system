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
  Search,
  Filter,
  RefreshCw,

} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { exportService } from "@/services/exportService";
import ExportButtons from "@/components/ui/ExportButtons";

// Define available semesters for filtering
const semesters = Array.from({ length: 12 }, (_, i) => `${i + 1}`);

const StudentList = () => {
  useAuthGuard(["admin", "admission"]);

  const { students, isLoading, fetchStudents, updateStudent, deleteStudent } =
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
    setIsEditDialogOpen(false);
    toast.success("Student information updated successfully");
  };

  // Handle deleting a student
  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteStudent(id);
      toast.success("Student deleted successfully");
    } catch (error) {
      toast.error("Failed to delete student");
      console.error("Error deleting student:", error);
    }
  };

  // Filter students based on search term and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.department?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesId = idFilter ? student.studentId.includes(idFilter) : true;

    const matchesSemester = semesterFilter && semesterFilter !== 'all'
      ? student.semester === semesterFilter
      : true;

    // We'll implement status filtering when the status field is added to the API
    const matchesStatus = statusFilter && statusFilter !== 'all'
      ? true // Replace with actual status check when implemented
      : true;

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
                }}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
              <ExportButtons
              onExportPDF={() => exportService.exportStudentsPDF()}
              onExportExcel={() => exportService.exportStudentsExcel()}
              />
           
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
                    {/* <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem> */}
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
                  <TableHead>Student Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Faculty
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Department
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Batch
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Semester
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Session
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Tel
                  </TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead className="text-right">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Loading student data...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      No students found matching your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow 
                      key={student.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewStudent(student)}
                    >
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.faculty?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.department?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.registerYear || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.semester || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.session || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.phoneNumber || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`px-2 py-1 ${student.academicYear ? "bg-green-500" : "bg-gray-500"}`}
                        >
                          {student.academicYear ? "Active" : "Pending"}
                        </Badge>
                      </TableCell>

                      {/* <TableCell className="text-right">
                      <div
                      className="flex justify-center item-center cursor-pointer"
                              onClick={() => handleViewStudent(student)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> 
                            </div>  

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
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the student
                                    record for {student.fullName} and remove their data from the system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteStudent(student.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell> */}
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
      />

      {/* Edit Dialog */}
      <StudentDetailDialog
        student={selectedStudent}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </div>
  );
};

export default StudentList;
