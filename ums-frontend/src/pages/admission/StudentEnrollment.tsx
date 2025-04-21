import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useAuthGuard } from "@/hooks/useAuthGuard";

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
  studentId: z.string().min(1, "Student ID is required"),
  studentName: z.string().min(1, "Student name is required"),
  faculty: z.string().min(1, "Faculty is required"),
  department: z.string().min(1, "Department is required"),
  session: z.string().min(1, "Session is required"),
  class: z.string().min(1, "Class is required"),
  sem: z.string().min(1, "Semester is required"),
  batch: z.string().min(1, "Batch is required"),
  tell: z.string().min(1, "Tell is required"),
  status: z.string().min(1, "Status is required"),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

// Student type
interface Student {
  id: string;
  studentId: string;
  studentName: string;
  password: string;
  department: string;
  sem: string;
  batch: string;
  tell: string;
  session: string;
  status: string;
}

const StudentEnrollment = () => {
  useAuthGuard(["admission"]);

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Setup form
  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      studentId: "",
      studentName: "",
      password: "",
      department: "",
      session: "",
      sem: "",
      batch: "",
      tell: "",
      status: "",
    },
  });

  // Load sample data
  useEffect(() => {
    // This would be an API call in a real application
    const sampleStudents: Student[] = [
      {
        id: "1",
        studentId: "STU001",
        studentName: "John Doe",
        password: "xckhvsdjkgsh",
        department: "Computer Engineering",
        session: "Weekend",
        sem: "3",
        batch: "BS",
        tell: "1234567890",
        status: "Active",
      },
      {
        id: "2",
        studentId: "STU002",
        studentName: "Jane Smith",
        password: "dgjkshdjfas",
        department: "Physics",
        session: "Regular",
        sem: "2",
        batch: "BS",
        tell: "9876543210",
        status: "Active",
      },
      {
        id: "3",
        studentId: "STU003",
        studentName: "Alice Johnson",
        password: "djhgasjkga",
        department: "Finance",
        session: "Distance",
        sem: "3",
        batch: "BS",
        tell: "5555555555",
        status: "Inactive",
      },
    ];
    setStudents(sampleStudents);
  }, []);

  // Handle form submission
  const onSubmit = (data: EnrollmentFormValues) => {
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

  // Handle editing a student
  const handleEdit = (student: Student) => {
    setCurrentStudent(student);
    setIsEditing(true);

    // Find faculty ID by name
    const faculty = FACULTIES.find((f) => f.name === student.faculty);
    if (faculty) {
      setSelectedFaculty(faculty.id);
    }

    form.reset({
      studentId: student.studentId,
      studentName: student.studentName,
      faculty: faculty?.id || "",
      department:
        Object.entries(DEPARTMENTS)
          .flatMap(([_, depts]) => depts)
          .find((d) => d.name === student.department)?.id || "",
      session: student.session,
      class: student.class,
    });

    setIsDialogOpen(true);
  };

  // Handle deleting a student
  const handleDelete = (id: string) => {
    setStudents((prev) => prev.filter((student) => student.id !== id));
    toast.success("Student removed successfully");
  };

  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Enrollment"
        // description="Manage student enrollments"
        action={{
          label: "Enroll Student",
          icon: Plus,
          onClick: () => {
            resetForm();
            setIsDialogOpen(true);
          },
        }}
      />

      <div className="rounded-lg border bg-card">
        <div className="p-4 flex items-center justify-between border-b">
          <h3 className="text-lg font-medium">Students</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students ID, name..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Sem</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Tell</TableHead>
                <TableHead>Status</TableHead>

                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell>{student.password}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>{student.batch}</TableCell>
                    <TableCell>{student.sem}</TableCell>
                    <TableCell>{student.session}</TableCell>
                    <TableCell>{student.tell}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-white ${student.status === "Active" ? "bg-green-500" : "bg-red-500"}`}
                      >
                        {student.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Student" : "Enroll New Student"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update student enrollment details"
                : "Fill in the details to enroll a new student"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          form.setValue("department", ""); // Reset department when faculty changes
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
                      <FormControl>
                        <Input placeholder="e.g., 2023-2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Year 1">Year 1</SelectItem>
                          <SelectItem value="Year 2">Year 2</SelectItem>
                          <SelectItem value="Year 3">Year 3</SelectItem>
                          <SelectItem value="Year 4">Year 4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  {isEditing ? "Update Student" : "Enroll Student"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentEnrollment;
