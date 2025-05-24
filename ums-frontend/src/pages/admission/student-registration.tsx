import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Student } from "@/types/student";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button";
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
import { Loader2, Slash } from "lucide-react";
import { useDepartmentStore } from "@/store/useDepartmentStore";
import { useFacultyStore } from "@/store/useFacultyStore";
import { useStudentStore } from "@/store/useStudentStore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Academic years and semesters
const ACADEMIC_YEARS = [
  { id: "2023", name: "2023-2024" },
  { id: "2024", name: "2024-2025" },
  { id: "2025", name: "2025-2026" },
];

const SEMESTERS = [
  { id: "1", name: "First Semester" },
  { id: "2", name: "Second Semester" },
  { id: "3", name: "Summer Semester" },
];

const SESSIONS = [
  { id: "morning", name: "Morning" },
  { id: "afternoon", name: "Afternoon" },
  { id: "evening", name: "Evening" },
  { id: "weekend", name: "Weekend" },
];

// Define the form schema with Zod
const studentSchema = z.object({
  // Personal Information
  fullName: z.string().min(3, "Full name is required and must be at least 3 characters"),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  
  // Academic Background
  highSchoolName: z.string().min(1, "High school name is required"),
  highSchoolCity: z.string().min(1, "High school city is required"),
  graduationYear: z.string().min(1, "Graduation year is required").transform(val => parseInt(val)),
  averagePass: z.string().min(1, "GPA is required").transform(val => parseFloat(val)),

  // Program Information
  facultyId: z.string().min(1, "Faculty is required"),
  departmentId: z.string().min(1, "Department is required"),
  session: z.string().min(1, "Session is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  registerYear: z.string().min(1, "Register year is required").transform(val => parseInt(val)),
  semester: z.string().min(1, "Semester is required"),
  
  // Hidden fields that will be set programmatically
  userId: z.string().optional(),
  studentId: z.string().optional()
});

type StudentFormValues = z.infer<typeof studentSchema>;

// Use the Student type from our types directory
// This ensures we're aligned with the API expectations

const RegistrationForm = () => {
  useAuthGuard(["admission"]);
  const navigate = useNavigate();

  // Get data from stores
  const { faculties, fetchFaculties } = useFacultyStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { addStudent, isLoading } = useStudentStore();

  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([]);

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

  // Setup form
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
      graduationYear: "",
      averagePass: "",

      // Program Information
      facultyId: "",
      departmentId: "",
      session: "",
      academicYear: "",
      registerYear: new Date().getFullYear().toString(),
      semester: "",
    },
  });

  // Update filtered departments when faculty changes
  useEffect(() => {
    if (selectedFaculty && departments.length > 0) {
      const depts = departments.filter(dept => dept.facultyId === selectedFaculty);
      setFilteredDepartments(depts);
    } else {
      setFilteredDepartments([]);
    }
  }, [selectedFaculty, departments]);

  // Watch faculty selection to filter departments
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'facultyId' && value.facultyId) {
        setSelectedFaculty(value.facultyId);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Handle form submission
  const onSubmit = async (data: StudentFormValues) => {
    try {
      // Generate a student ID (this would normally be done by the backend)
      const year = new Date().getFullYear().toString().slice(-2);
      const facultyCode = faculties.find(f => f.id === data.facultyId)?.code || 'XX';
      const deptCode = departments.find(d => d.id === data.departmentId)?.code || 'XX';
      const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
      
      const studentId = `${year}${facultyCode}${deptCode}${randomNum}`;
      
      // Get current user ID from localStorage
      const userJson = localStorage.getItem('user');
      const userId = userJson ? JSON.parse(userJson).id : null;
      
      // Prepare student data - ensure it matches the API expected structure
      const studentData = {
        studentId,
        userId: userId,
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
        semester: data.semester
      };
      
      console.log('Submitting student data:', studentData);
      
      // Add student to database
      await addStudent(studentData);
      
      toast.success("Student registered successfully");
      navigate("/admission/student-enrollment");
    } catch (error) {
      console.error("Error registering student:", error);
      toast.error("Failed to register student");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Registration"
        description="Register a new student in the system"
      />

<Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admission/student-enrollment">Student Enrollment</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>       
        <BreadcrumbItem>
          <BreadcrumbPage>Registration</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>Student Registration Form</CardTitle>
        </CardHeader>
        <CardContent>
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
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                              <FormControl>
                                <RadioGroupItem value="male" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Male
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="female" />
                              </FormControl>
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
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
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
                        <FormLabel>GPA / Average Pass</FormLabel>
                        <FormControl>
                          <Input placeholder="3.5" {...field} />
                        </FormControl>
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
                        <FormLabel>Academic Year</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select academic year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ACADEMIC_YEARS.map((year) => (
                              <SelectItem key={year.id} value={year.id}>
                                {year.name}
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
                    name="registerYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Year</FormLabel>
                        <FormControl>
                          <Input placeholder={new Date().getFullYear().toString()} {...field} />
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
                  onClick={() => navigate("/admission/students")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register Student"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
