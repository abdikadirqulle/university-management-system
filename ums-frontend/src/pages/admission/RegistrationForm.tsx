import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

import { Separator } from "@/components/ui/separator";

// Sample data
const FACULTIES = [
  { id: "1", name: "Engineering" },
  { id: "2", name: "Science" },
  { id: "3", name: "Arts" },
  { id: "4", name: "Business" },
];

const DEPARTMENTS = {
  "1": [
    { id: "101", name: "Computer Engineering" },
    { id: "102", name: "Electrical Engineering" },
    { id: "103", name: "Mechanical Engineering" },
  ],
  "2": [
    { id: "201", name: "Physics" },
    { id: "202", name: "Chemistry" },
    { id: "203", name: "Mathematics" },
  ],
  "3": [
    { id: "301", name: "Literature" },
    { id: "302", name: "History" },
    { id: "303", name: "Philosophy" },
  ],
  "4": [
    { id: "401", name: "Marketing" },
    { id: "402", name: "Finance" },
    { id: "403", name: "Management" },
  ],
};

// Define the form schema with Zod
const enrollmentSchema = z.object({
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

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

// Student type
interface Student {
  // Personal Information
  id: string;
  studentName: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  email: string;
  tell: string;

  // School Information
  highSchoolName: string;
  highSchoolCity: string;
  graduationYear: string;
  averagePass: string;

  // Program Information
  faculty: string;
  department: string;
  session: string;
  academicYear: string;
  registerYear: string;
  semester: string;
}

export const RegistrationForm = ({
  isDialogOpen,
  setIsDialogOpen,
}: {
  setIsDialogOpen: (open: boolean) => void;
  isDialogOpen: boolean;
}) => {
  useAuthGuard(["admission"]);

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Setup form
  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      // Personal Information
      studentName: "",
      gender: "",
      dateOfBirth: "",
      placeOfBirth: "",
      email: "",
      tell: "",

      // School Information
      highSchoolName: "",
      highSchoolCity: "",
      graduationYear: "",
      averagePass: "",

      // Program Information
      faculty: "",
      department: "",
      session: "",
      academicYear: "",
      registerYear: "",
      semester: "",
    },
  });

  // Handle form submission
  const onSubmit = (data: EnrollmentFormValues) => {
    console.log("student form data:", data);
    if (isEditing && currentStudent) {
      // Update existing student
      setStudents((prev) =>
        prev.map((student) =>
          student.id === currentStudent.id ? { ...student, ...data } : student,
        ),
      );
      toast.success("Student updated successfully");
    } else {
      // Add new student
      const newStudent: Student = {
        id: Date.now().toString(),
        ...data,
      };
      setStudents((prev) => [...prev, newStudent]);
      toast.success("Student enrolled successfully");
    }
    setIsDialogOpen(false);
    resetForm();
  };

  // Reset form and editing state
  const resetForm = () => {
    form.reset();
    setIsEditing(false);
    setCurrentStudent(null);
    setSelectedFaculty("");
  };

  // Filter departments based on selected faculty
  const filteredDepartments = selectedFaculty
    ? DEPARTMENTS[selectedFaculty as keyof typeof DEPARTMENTS] || []
    : [];

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Student" : "Student Registration"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update student registration details"
                : "Fill in the student registration form"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
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
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
                          <Input
                            placeholder="Enter place of birth"
                            {...field}
                          />
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
                            placeholder="Enter email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tell"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* School Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">School Information</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="highSchoolName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>High School Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter high school name"
                            {...field}
                          />
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
                          <Input
                            placeholder="Enter high school city"
                            {...field}
                          />
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
                        <FormLabel>HS Graduation Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter graduation year"
                            {...field}
                          />
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
                        <FormLabel>HS Average Pass</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter average pass"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Program Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Program Information</h3>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="faculty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faculty</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedFaculty(value);
                            form.setValue("department", "");
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select faculty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FACULTIES.map((faculty) => (
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
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedFaculty}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredDepartments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
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
                    name="session"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Session" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="weekend">Weekend</SelectItem>
                            <SelectItem value="distance">Distance</SelectItem>
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
                        <FormLabel>Academic Year</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter academic year" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registerYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Register Year</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter register year" {...field} />
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
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="7">7</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="9">9</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="11">11</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Student" : "Register Student"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
