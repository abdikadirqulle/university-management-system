import React, { useEffect, useState } from "react";
import { useStudentStore } from "@/store/useStudentStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Student } from "@/types/student";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import StudentTable from "@/components/admin/StudentTable";
import StudentForm from "@/components/admin/StudentForm";

const Students = () => {
  useAuthGuard(["admin", "admission"]);
  
  const { students, isLoading, fetchStudents, deleteStudent } = useStudentStore();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (selectedStudent) {
      await deleteStudent(selectedStudent.id);
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
    }
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedStudent(null);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Management"
        description="Manage student records, enrollment, and academic information"
        action={{
          label: "Add Student",
          icon: Plus,
          onClick: () => setIsOpen(true),
        }}
      />
        

      <StudentTable
        students={students}
        isLoading={isLoading}
        onEditStudent={handleEditStudent}
        onDeleteStudent={handleDeleteStudent}
      />

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter the student details below to create a new student record.
            </DialogDescription>
          </DialogHeader>
          <StudentForm onClose={closeAddDialog} />
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student details below.
            </DialogDescription>
          </DialogHeader>
          <StudentForm student={selectedStudent} onClose={closeEditDialog} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              student record for{" "}
              <span className="font-semibold">
                {selectedStudent?.fullName}
              </span>{" "}
              and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStudent}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Students;
