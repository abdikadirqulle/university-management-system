import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { exportService } from "@/services/exportService";
import ExportButtons from "@/components/ui/ExportButtons";
import PageHeader from "@/components/PageHeader";
import { Course, useCourseStore } from "@/store/useCourseStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { departmentService } from "@/services/departmentService";

// Form schema
const courseFormSchema = z.object({
  code: z.string().min(2, { message: "Course code is required" }),
  title: z.string().min(3, { message: "Course title is required" }),
  departmentId: z.string().min(2, { message: "Department is required" }),
  credits: z.coerce
    .number()
    .min(1, { message: "Credits must be at least 1" })
    .max(6),
  academicYear: z.string().min(1, { message: "Academic year is required" }),
  semester: z.string().min(1, { message: "Semester is required" }),
  instructor: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

// Semesters
const semesters = Array.from({ length: 12 }, (_, i) => `${i + 1}`);

const CoursesPage = () => {
  const {
    courses,
    fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    isLoading,
  } = useCourseStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Setup form
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      code: "",
      title: "",
      departmentId: "",
      credits: 3,
      academicYear: "",
      semester: "",
      instructor: "",
    },
  });

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Fetch departments for dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const data = await departmentService.getAllDepartments();
        setDepartments(data.map(dept => ({ id: dept.id, name: dept.name })));
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Failed to load departments");
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingCourse(null);
    }
    setIsOpen(open);
  };

  // Handle form submission
  const onSubmit = async (data: CourseFormValues) => {
    try {
      // Find department name for display purposes
      const selectedDept = departments.find(d => d.id === data.departmentId);
      const departmentName = selectedDept ? selectedDept.name : "Unknown Department";

      if (editingCourse) {
        // Update existing course
        await updateCourse(editingCourse.id, {
          ...data,
          department: departmentName,
          instructor: data.instructor || "Not assigned",
        });
        toast.success("Course updated successfully");
      } else {
        // Add new course
        await addCourse({
          ...data,
          department: departmentName,
          instructor: data.instructor || "Not assigned",
        });
        toast.success("Course added successfully");
      }
      handleDialogOpenChange(false);
    } catch (error) {
      toast.error("Failed to save course");
      console.error(error);
    }
  };

  // Handle edit course
  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    form.reset({
      code: course.code,
      title: course.title,
      departmentId: course.departmentId,
      credits: course.credits,
      academicYear: course.academicYear,
      semester: course.semester,
      instructor: course.instructor || "",
    });
    setIsOpen(true);
  };

  // Handle delete course
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await deleteCourse(id);
        toast.success("Course deleted successfully");
      } catch (error) {
        toast.error("Failed to delete course");
        console.error(error);
      }
    }
  };

  // Define columns
  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "faculty",
      header: "Faculty",
      cell: ({ row }) => row.original.faculty || "Not specified",
    },
    {
      accessorKey: "credits",
      header: "Credits",
    },
    {
      accessorKey: "academicYear",
      header: "Academic Year",
    },
    {
      accessorKey: "semester",
      header: "Semester",
    },
    {
      accessorKey: "instructor",
      header: "Instructor",
      cell: ({ row }) => row.original.instructor || "Not assigned",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(course)}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(course.id)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management"
        description="Manage courses, assign instructors, and organize academic offerings"
        action={{
          label: "Add Course",
          icon: Plus,
          onClick: () => setIsOpen(true),
        }}
      />
      
      <div className="flex justify-end mb-4">
        <ExportButtons
          onExportPDF={() => exportService.exportCoursesPDF()}
          onExportExcel={() => exportService.exportCoursesExcel()}
        />
      </div>
        
     

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading courses...</span>
          </div>
        ) : (
          <DataTable columns={columns} data={courses} />
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </DialogTitle>
            <DialogDescription>
              {editingCourse
                ? 'Update the course details below'
                : 'Fill in the course details below to add a new course'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CS101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Introduction to Programming"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingDepartments ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Loading...
                            </div>
                          ) : departments.length === 0 ? (
                            <div className="p-2 text-center text-muted-foreground">
                              No departments found
                            </div>
                          ) : (
                            departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                          {semesters.map((sem) => (
                            <SelectItem key={sem} value={sem}>
                              {sem}
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
                      <FormControl>
                        <Input
                          placeholder="e.g. 2024-2025"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Dr. John Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional. Leave blank if not yet assigned.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={form.formState.isSubmitting || isLoading}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingCourse ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    editingCourse ? "Update Course" : "Add Course"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoursesPage;
