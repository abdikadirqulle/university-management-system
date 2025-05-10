import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Search, Plus, Edit, Trash2, RefreshCw, UserPlus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useAuthGuard } from "@/hooks/useAuthGuard";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStudentStore } from "@/store/useStudentStore";
import { Student } from "@/types/student";
import StudentDetailDialog from "@/components/admission/StudentDetailDialog";



const StudentEnrollment = () => {
  useAuthGuard(["admission"]);
  const navigate = useNavigate();
  const { students, isLoading, fetchStudents, updateStudent, deleteStudent } = useStudentStore();
  
  // State for student management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle viewing student details
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  // Handle editing a student
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

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    return (
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Enrollment Management"
        description="View, update, and manage enrolled students"
        action={{
          label: "Register New Student",
          icon: UserPlus,
          onClick: () => navigate("/admission/registration"),
        }}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>
                Manage student enrollment records
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchStudents();
                  setSearchTerm("");
                  toast.success("Student data refreshed");
                }}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search section */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, or email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="hidden md:table-cell">Semester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading student data...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
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
                        {student.department?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.semester}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`px-2 py-1 ${student.academicYear ? "bg-green-500" : "bg-gray-500"}`}
                        >
                          {student.academicYear ? "Active" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewStudent(student)}
                          >
                            <Search className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete</span>
                              </Button>
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
                        </div>
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

export default StudentEnrollment;
