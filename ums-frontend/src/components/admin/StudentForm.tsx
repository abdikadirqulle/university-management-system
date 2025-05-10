import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Student, Gender } from "@/types/student";
import { useStudentStore } from "@/store/useStudentStore";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useFacultyStore } from "@/store/useFacultyStore";
import { useDepartmentStore } from "@/store/useDepartmentStore";
import { useUserStore } from "@/store/useUserStore";

// Define the form schema with Zod
const studentFormSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  userId: z.string().min(1, "User is required"),
  fullName: z.string().min(1, "Full name is required"),
  gender: z.enum(["male", "female"] as const),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  highSchoolName: z.string().min(1, "High school name is required"),
  highSchoolCity: z.string().min(1, "High school city is required"),
  graduationYear: z.string().min(1, "Graduation year is required"),
  averagePass: z.string().min(1, "Average pass is required"),
  facultyId: z.string().min(1, "Faculty is required"),
  departmentId: z.string().min(1, "Department is required"),
  session: z.string().min(1, "Session is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  registerYear: z.string().min(1, "Register year is required"),
  semester: z.string().min(1, "Semester is required"),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  student?: Student | null;
  onClose: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onClose }) => {
  const { addStudent, updateStudent, isLoading } = useStudentStore();
  const { faculties, fetchFaculties } = useFacultyStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { users, fetchUsers } = useUserStore();
  const [filteredDepartments, setFilteredDepartments] = useState(departments);

  // Initialize the form with default values or existing student data
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: student
      ? {
          studentId: student.studentId,
          userId: student.userId,
          fullName: student.fullName,
          gender: student.gender,
          dateOfBirth: new Date(student.dateOfBirth).toISOString().split("T")[0],
          placeOfBirth: student.placeOfBirth,
          email: student.email,
          phoneNumber: student.phoneNumber,
          highSchoolName: student.highSchoolName,
          highSchoolCity: student.highSchoolCity,
          graduationYear: student.graduationYear.toString(),
          averagePass: student.averagePass.toString(),
          facultyId: student.facultyId,
          departmentId: student.departmentId,
          session: student.session,
          academicYear: student.academicYear,
          registerYear: student.registerYear.toString(),
          semester: student.semester,
        }
      : {
          studentId: "",
          userId: "",
          fullName: "",
          gender: "male" as Gender,
          dateOfBirth: "",
          placeOfBirth: "",
          email: "",
          phoneNumber: "",
          highSchoolName: "",
          highSchoolCity: "",
          graduationYear: "",
          averagePass: "",
          facultyId: "",
          departmentId: "",
          session: "",
          academicYear: "",
          registerYear: new Date().getFullYear().toString(),
          semester: "",
        },
  });

  // Fetch faculties, departments, and users on component mount
  useEffect(() => {
    fetchFaculties();
    fetchDepartments();
    fetchUsers();
  }, [fetchFaculties, fetchDepartments, fetchUsers]);

  // Filter departments based on selected faculty
  useEffect(() => {
    const facultyId = form.watch("facultyId");
    if (facultyId) {
      setFilteredDepartments(
        departments.filter((dept) => dept.facultyId === facultyId)
      );
    } else {
      setFilteredDepartments(departments);
    }
  }, [form.watch("facultyId"), departments]);

  // Handle form submission
  const onSubmit = async (values: StudentFormValues) => {
    try {
      const studentData = {
        ...values,
        graduationYear: parseInt(values.graduationYear),
        averagePass: parseFloat(values.averagePass),
        registerYear: parseInt(values.registerYear),
      };

      if (student) {
        // Update existing student
        await updateStudent(student.id, studentData);
      } else {
        // Add new student
        await addStudent(studentData as Omit<Student, "id">);
      }
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Student ID */}
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., STU001"
                    {...field}
                    disabled={!!student}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* User */}
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Account</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!!student}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users
                      .filter((user) => user.role === "student")
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date of Birth */}
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Place of Birth */}
          <FormField
            control={form.control}
            name="placeOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place of Birth</FormLabel>
                <FormControl>
                  <Input placeholder="Place of birth" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* High School Name */}
          <FormField
            control={form.control}
            name="highSchoolName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>High School Name</FormLabel>
                <FormControl>
                  <Input placeholder="High school name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* High School City */}
          <FormField
            control={form.control}
            name="highSchoolCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>High School City</FormLabel>
                <FormControl>
                  <Input placeholder="High school city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Graduation Year */}
          <FormField
            control={form.control}
            name="graduationYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Graduation Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Graduation year"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Average Pass */}
          <FormField
            control={form.control}
            name="averagePass"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Average Pass</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Average pass"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Faculty */}
          <FormField
            control={form.control}
            name="facultyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faculty</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset department when faculty changes
                    form.setValue("departmentId", "");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Department */}
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!form.watch("facultyId")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredDepartments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Session */}
          <FormField
            control={form.control}
            name="session"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2023-2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Academic Year */}
          <FormField
            control={form.control}
            name="academicYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Academic Year</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2023-2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Register Year */}
          <FormField
            control={form.control}
            name="registerYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Register Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Register year"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Semester */}
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Fall 2023" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {student ? "Update Student" : "Add Student"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StudentForm;
