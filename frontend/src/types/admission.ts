export interface StudentApplication {
  id: string;
  fullName: string;
  email: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  desiredDepartment: string;
  documents?: string[];
  status: "pending" | "approved" | "rejected";
  applicationDate: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}
