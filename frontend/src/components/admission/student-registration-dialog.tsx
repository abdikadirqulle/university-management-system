import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Student } from "@/types/student";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Loader2 } from "lucide-react";
import { useDepartmentStore } from "@/store/useDepartmentStore";
import { useFacultyStore } from "@/store/useFacultyStore";
import { useStudentStore } from "@/store/useStudentStore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "../ui/button";

const SEMESTERS = Array.from({ length: 12 }, (_, i) => ({
  id: `${i + 1}`,
  name: `${i + 1}`,
}));

const SESSIONS = [
  { id: "regular", name: "Regular" },
  { id: "distance", name: "Distance" },
  { id: "weekend", name: "Weekend" },
];

// Define the form schema with Zod
const studentSchema = z.object({
  // Personal Information
  fullName: z
    .string()
    .min(3, "Full name is required and must be at least 3 characters")
    .regex(
      /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z\s]*$/,
      "Full name should only contain letters and spaces",
    )
    .transform((val) => val.trim()),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        return age - 1 >= 15;
      }
      return age >= 15;
    }, "Student must be at least 15 years old"),
  placeOfBirth: z
    .string()
    .min(1, "Place of birth is required")
    .regex(
      /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z\s,]*$/,
      "Place of birth should only contain letters, spaces, and commas",
    ),
  email: z
    .string()
    .email("Email address is required")
    .transform((val) => val.toLowerCase().trim()),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(
      /^\+252\d{9}$/,
      "Phone number must start with +252 followed by 9 digits",
    )
    .transform((val) => {
      if (!val.startsWith("+252")) {
        return `+252${val.replace(/^\+252/, "")}`;
      }
      return val;
    }),

  // Academic Background
  highSchoolName: z
    .string()
    .min(1, "High school name is required")
    .regex(
      /^[a-zA-Z0-9\s\-.,]*$/,
      "High school name contains invalid characters",
    ),
  highSchoolCity: z
    .string()
    .min(1, "High school city is required")
    .regex(/^[a-zA-Z\s]*$/, "City should only contain letters and spaces"),
  graduationYear: z
    .string()
    .min(1, "Graduation year is required")
    .transform((val) => parseInt(val))
    .refine((year) => {
      const currentYear = new Date().getFullYear();
      return year <= currentYear && year >= currentYear - 10;
    }, "Graduation year must be between current year and 10 years ago"),
  averagePass: z
    .string()
    .min(1, "Average pass is required")
    .refine((val) => {
      const trimmedVal = val.trim().toUpperCase();

      // Check if it's a percentage (0-100)
      const percentage = parseFloat(trimmedVal);
      if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
        return true;
      }

      // Check if it's a letter grade (A, A+, A-, B, B+, B-, C, C+, C-, D, D+, D-, F)
      const letterGrades = [
        "A+",
        "A",
        "A-",
        "B+",
        "B",
        "B-",
        "C+",
        "C",
        "C-",
        "D+",
        "D",
        "D-",
        "F",
      ];
      if (letterGrades.includes(trimmedVal)) {
        return true;
      }

      return false;
    }, "Average pass must be either a percentage (0-100) or a letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F)")
    .transform((val) => val.trim().toUpperCase()),

  // Program Information
  facultyId: z.string().min(1, "Faculty is required"),
  departmentId: z.string().min(1, "Department is required"),
  session: z.string().min(1, "Session is required"),
  academicYear: z
    .string()
    .min(1, "Academic year is required")
    .regex(/^\d{4}-\d{4}$/, "Academic year must be in format YYYY-YYYY")
    .refine((year) => {
      const [startYear] = year.split("-").map(Number);
      const currentYear = new Date().getFullYear();
      return startYear >= currentYear && startYear <= currentYear + 1;
    }, "Academic year must be current or next year"),
  registerYear: z
    .string()
    .min(1, "Register year is required")
    .transform((val) => parseInt(val))
    .refine((year) => {
      const currentYear = new Date().getFullYear();
      return year === currentYear;
    }, "Registration year must be current year"),
  semester: z.string().min(1, "Semester is required"),

  // Hidden fields that will be set programmatically
  userId: z.string().optional(),
  studentId: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  student?: Student;
}

interface Department {
  id: string;
  name: string;
  facultyId: string;
}

const StudentRegistrationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  student,
}: StudentRegistrationDialogProps) => {
  useAuthGuard(["admin", "admission"]);

  // Determine if we're in edit mode
  const isEditMode = !!student;

  // Get data from stores
  const { faculties, fetchFaculties } = useFacultyStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { addStudent, updateStudent, isLoading } = useStudentStore();

  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(
    [],
  );

  // Fetch faculties and departments on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchFaculties(), fetchDepartments()]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load faculties and departments");
      }
    };

    fetchData();
  }, [fetchFaculties, fetchDepartments]);

  // Populate form with student data when in edit mode and when dialog opens
  useEffect(() => {
    if (isEditMode && student && open) {
      // Convert numeric values to strings for the form
      const graduationYearStr = student.graduationYear?.toString() || "";
      const registerYearStr = student.registerYear?.toString() || "";
      const averagePassStr = student.averagePass?.toString() || "";

      // Reset the form with student data
      form.reset({
        // Personal Information
        fullName: student.fullName || "",
        gender: student.gender || "male",
        dateOfBirth: student.dateOfBirth || "",
        placeOfBirth: student.placeOfBirth || "",
        email: student.email || "",
        phoneNumber: student.phoneNumber || "",

        // Academic Background
        highSchoolName: student.highSchoolName || "",
        highSchoolCity: student.highSchoolCity || "",
        graduationYear: parseInt(graduationYearStr),
        averagePass: averagePassStr,

        // Program Information
        facultyId: student.facultyId || "",
        departmentId: student.departmentId || "",
        session: student.session || "",
        academicYear: student.academicYear || "",
        registerYear: parseInt(registerYearStr),
        semester: student.semester || "",
      });

      // Set selected faculty to filter departments
      if (student.facultyId) {
        setSelectedFaculty(student.facultyId);
      }
    } else if (!isEditMode && open) {
      // Reset form when opening for a new student
      form.reset();
    }
  }, [student, isEditMode, open]);

  // Setup form with default values
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      // Personal Information
      fullName: "",
      gender: "male",
      dateOfBirth: "",
      placeOfBirth: "",
      email: "",
      phoneNumber: "",

      // Academic Background
      highSchoolName: "",
      highSchoolCity: "",
      graduationYear: new Date().getFullYear(),
      averagePass: "",

      // Program Information
      facultyId: "",
      departmentId: "",
      session: "",
      academicYear: "",
      registerYear: 0,
      semester: "",
    },
  });

  // Update filtered departments when faculty changes
  useEffect(() => {
    if (selectedFaculty && departments.length > 0) {
      const depts = departments.filter(
        (dept) => dept.facultyId === selectedFaculty,
      );
      setFilteredDepartments(depts);
    } else {
      setFilteredDepartments([]);
    }
  }, [selectedFaculty, departments]);

  // Watch faculty selection to filter departments
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "facultyId" && value.facultyId) {
        setSelectedFaculty(value.facultyId);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Handle form submission
  const onSubmit = async (data: StudentFormValues) => {
    try {
      // Prepare student data - ensure it matches the API expected structure
      const studentData = {
        fullName: data.fullName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        placeOfBirth: data.placeOfBirth,
        email: data.email,
        phoneNumber: data.phoneNumber,
        highSchoolName: data.highSchoolName,
        highSchoolCity: data.highSchoolCity,
        graduationYear: data.graduationYear,
        averagePass: data.averagePass,
        facultyId: data.facultyId,
        departmentId: data.departmentId,
        session: data.session,
        academicYear: data.academicYear,
        registerYear: data.registerYear,
        semester: data.semester,
      };

      if (isEditMode && student) {
        // Update existing student
        await updateStudent(student.id, studentData);
        toast.success("Student updated successfully");
      } else {
        // Generate a student ID for new students (this would normally be done by the backend)
        const year = new Date().getFullYear().toString().slice(-2);
        const facultyName =
          faculties.find((f) => f.id === data.facultyId)?.code || "XX";
        const deptName =
          departments.find((d) => d.id === data.departmentId)?.code || "XX";
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number

        // Use first 2 letters of faculty and department names
        const facultyCode = facultyName.substring(0, 2).toUpperCase();
        const deptCode = deptName.substring(0, 2).toUpperCase();

        const studentId = `${year}${facultyCode}${deptCode}${randomNum}`;

        // Get current user ID from localStorage
        const userJson = localStorage.getItem("user");
        const userId = userJson ? JSON.parse(userJson).id : null;

        // Add additional fields for new student
        const newStudentData = {
          ...studentData,
          studentId,
          userId: userId,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Add student to database
        await addStudent(newStudentData);
        toast.success("Student registered successfully");
      }

      // Close dialog and refresh data
      if (onSuccess) {
        onSuccess();
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error processing student data:", error);
      toast.error(
        isEditMode ? "Failed to update student" : "Failed to register student",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Student" : "Student Registration"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the student's information below."
              : "Fill in the student details to register a new student."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-medium">Personal Information</h3>
              <Separator className="my-4" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <RadioGroupItem value="male" />
                            <FormLabel className="font-normal">Male</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <RadioGroupItem value="female" />
                            <FormLabel className="font-normal">
                              Female
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <FormField
                  control={form.control}
                  name="placeOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Birth</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+252XXXXXXXXX"
                          {...field}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (!value.startsWith("+252")) {
                              value = "+252" + value.replace(/^\+252/, "");
                            }
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Must start with +252 followed by 9 digits
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Academic Background Section */}
            <div>
              <h3 className="text-lg font-medium">Academic Background</h3>
              <Separator className="my-4" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="highSchoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>High School Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Central High School" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="highSchoolCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>High School City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="graduationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Year</FormLabel>
                      <FormControl>
                        <Input placeholder="2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="averagePass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Pass / GPA</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 89 or A+"
                          {...field}
                          onChange={(e) => {
                            let value = e.target.value;
                            // Convert to uppercase for letter grades
                            value = value.toUpperCase();
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter percentage (0-100) or letter grade (A+, A, A-, B+,
                        B, B-, C+, C, C-, D+, D, D-, F)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Program Information Section */}
            <div>
              <h3 className="text-lg font-medium">Program Information</h3>
              <Separator className="my-4" />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="facultyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faculty</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a faculty" />
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

                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedFaculty}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredDepartments.length > 0 ? (
                            filteredDepartments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-2 text-sm text-muted-foreground">
                              No departments available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {!selectedFaculty && "Select a faculty first"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="session"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a session" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SESSIONS.map((session) => (
                            <SelectItem key={session.id} value={session.id}>
                              {session.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Academic Year <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="YYYY-YYYY"
                          {...field}
                          onChange={(e) => {
                            let value = e.target.value;
                            // Only allow numbers and hyphen
                            value = value.replace(/[^\d-]/g, "");
                            // Ensure proper format
                            if (value.length === 4 && !value.includes("-")) {
                              value = value + "-";
                            }
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Format: YYYY-YYYY (e.g., 2024-2025)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registerYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Year</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={new Date().getFullYear().toString()}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SEMESTERS.map((semester) => (
                            <SelectItem key={semester.id} value={semester.id}>
                              {semester.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Registering..."}
                  </>
                ) : isEditMode ? (
                  "Update Student"
                ) : (
                  "Register Student"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentRegistrationDialog;
