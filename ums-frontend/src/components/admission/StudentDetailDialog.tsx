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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface StudentDetailDialogProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

const StudentDetailDialog = ({
  student,
  isOpen,
  onClose,
}: StudentDetailDialogProps) => {
  if (!student) return null;

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="flex flex-col space-y-1">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-base">{value || '-'}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            View information for {student.fullName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <InfoRow label="Student ID" value={student.studentId} />
                <InfoRow label="Status" value={student.status} />
                <InfoRow label="Full Name" value={student.fullName} />
                <InfoRow label="Email" value={student.email} />
                <InfoRow label="Gender" value={student.gender} />
                <InfoRow label="Contact Number" value={student.phoneNumber} />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <InfoRow label="Department" value={student.department.name} />
                <InfoRow label="Enrollment Date" value={student.registerYear.toString()} />
                <InfoRow label="Semester" value={student.semester} />
                <InfoRow label="Session" value={student.session} />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="personal">
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <InfoRow label="Date of Birth" value={student.dateOfBirth} />
                <InfoRow label="Guardian Name" value={student.guardianName} />
                <InfoRow label="Guardian Contact" value={student.guardianContact} />
                <div className="col-span-2">
                  <InfoRow label="Address" value={student.address} />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailDialog;
