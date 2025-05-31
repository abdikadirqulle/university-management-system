import * as z from "zod";

export const EnrollmentSchema = z.object({
  // Personal Information
  studentName: z.string().min(1, "Student name is required"),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  email: z.string().email("Invalid email address"),
  tell: z.string().min(1, "Phone number is required"),

  // School Information
  highSchoolName: z.string().min(1, "High school name is required"),
  highSchoolCity: z.string().min(1, "High school city is required"),
  graduationYear: z.string().min(1, "HS graduation year is required"),
  averagePass: z.string().min(1, "HS average pass is required"),

  // Program Information
  faculty: z.string().min(1, "Faculty name is required"),
  department: z.string().min(1, "Department is required"),
  session: z.string().min(1, "Session is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  registerYear: z.string().min(1, "Register year is required"),
  semester: z.string().min(1, "Semester is required"),
});
