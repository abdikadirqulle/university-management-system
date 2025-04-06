
export interface Student {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  department: string;
  enrollmentDate: string;
  semester: string;
  session: string;
  status: "active" | "inactive" | "graduated" | "suspended";
  gender: "male" | "female" | "other";
  contactNumber?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianContact?: string;
  address?: string;
}
