import { useState } from "react";
import { Student } from "@/types/student";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StudentDetailDialogProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  viewOnly?: boolean;
}

const StudentDetailDialog = ({
  student,
  isOpen,
  onClose,
  onSave,
  viewOnly = false,
}: StudentDetailDialogProps) => {
  const [editableStudent, setEditableStudent] = useState<Student | null>(
    student,
  );

  // Reset form when student prop changes
  if (student && student.id !== editableStudent?.id) {
    setEditableStudent(student);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!editableStudent) return;
    setEditableStudent({
      ...editableStudent,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    if (!editableStudent) return;
    setEditableStudent({
      ...editableStudent,
      [field]: value,
    });
  };

  const handleSave = () => {
    if (editableStudent) {
      onSave(editableStudent);
    }
    onClose();
  };

  if (!editableStudent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {viewOnly ? "Student Details" : "Edit Student"}
          </DialogTitle>
          <DialogDescription>
            {viewOnly
              ? `View information for ${editableStudent.fullName}`
              : `Update information for ${editableStudent.fullName}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  value={editableStudent.studentId}
                  onChange={handleChange}
                  disabled={viewOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editableStudent.status}
                  onValueChange={(value) =>
                    handleSelectChange("status", value as Student["status"])
                  }
                  disabled={viewOnly}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={editableStudent.fullName}
                  onChange={handleChange}
                  disabled={viewOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={editableStudent.email}
                  onChange={handleChange}
                  disabled={viewOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={editableStudent.gender}
                  onValueChange={(value) =>
                    handleSelectChange("gender", value as Student["gender"])
                  }
                  disabled={viewOnly}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={editableStudent.contactNumber || ""}
                  onChange={handleChange}
                  disabled={viewOnly}
                />
              </div>
            </div>
          </TabsContent>

          {/* Academic Info Tab */}
          <TabsContent value="academic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={editableStudent.department}
                  onChange={handleChange}
                  disabled={viewOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                <Input
                  id="enrollmentDate"
                  name="enrollmentDate"
                  value={editableStudent.enrollmentDate}
                  onChange={handleChange}
                  disabled={viewOnly}
                  type="date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  name="semester"
                  value={editableStudent.semester}
                  onChange={handleChange}
                  disabled={viewOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session">Session</Label>
                <Input
                  id="session"
                  name="session"
                  value={editableStudent.session}
                  onChange={handleChange}
                  disabled={viewOnly}
                />
              </div>
            </div>
          </TabsContent>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={editableStudent.dateOfBirth || ""}
                  onChange={handleChange}
                  disabled={viewOnly}
                  type="date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianName">Guardian Name</Label>
                <Input
                  id="guardianName"
                  name="guardianName"
                  value={editableStudent.guardianName || ""}
                  onChange={handleChange}
                  disabled={viewOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianContact">Guardian Contact</Label>
                <Input
                  id="guardianContact"
                  name="guardianContact"
                  value={editableStudent.guardianContact || ""}
                  onChange={handleChange}
                  disabled={viewOnly}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={editableStudent.address || ""}
                  onChange={handleChange}
                  disabled={viewOnly}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {viewOnly ? "Close" : "Cancel"}
          </Button>
          {!viewOnly && <Button onClick={handleSave}>Save Changes</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailDialog;
