import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2 } from "lucide-react";
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

// Form schema
const courseFormSchema = z.object({
  code: z.string().min(2, { message: "Course code is required" }),
  title: z.string().min(3, { message: "Course title is required" }),
  department: z.string().min(2, { message: "Department is required" }),
  credits: z.coerce
    .number()
    .min(1, { message: "Credits must be at least 1" })
    .max(6),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  semester: z.string().min(1, { message: "Semester is required" }),
  instructor: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

// Sample departments
const departments = [
  "Computer Science",
  "Business",
  "Engineering",
  "Mathematics",
  "Physics",
  "Biology",
  "Chemistry",
  "Economics",
  "History",
  "Psychology",
];

// Sample semesters
const semesters = [
  "Fall 2023",
  "Spring 2024",
  "Summer 2024",
  "Fall 2024",
  "Spring 2025",
];

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

  // Setup form
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      code: "",
      title: "",
      department: "",
      credits: 3,
      description: "",
      semester: "",
      instructor: "",
    },
  });

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingCourse(null);
    }
    setIsOpen(open);
  };

  // Handle form submission
  const onSubmit = async (data: Course) => {
    try {
      if (editingCourse) {
        // Update existing course
        await updateCourse(editingCourse.id, data);
        toast.success("Course updated successfully");
      } else {
        // Add new course
        await addCourse(data);
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
      department: course.department,
      credits: course.credits,
      description: course.description,
      semester: course.semester,
      instructor: course.instructor || "",
    });
    setIsOpen(true);
  };

  // Handle delete course
  const handleDelete = async (id: string) => {
    try {
      await deleteCourse(id);
      toast.success("Course deleted successfully");
    } catch (error) {
      toast.error("Failed to delete course");
      console.error(error);
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
      accessorKey: "credits",
      header: "Credits",
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
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(course.id)}
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
        title="Courses"
        description="Manage university courses"
        action={{
          label: "Add Course",
          icon: Plus,
          onClick: () => setIsOpen(true),
        }}
      />

      <DataTable columns={columns} data={courses} loading={isLoading} />

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Course" : "Add New Course"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse
                ? "Update course information in the form below."
                : "Fill in the details to create a new course."}
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
                        <Input placeholder="E.g., CS101" {...field} />
                      </FormControl>
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
                          placeholder="3"
                          min={1}
                          max={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Number of credit hours (1-6)
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter course title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
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
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
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
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter course description"
                        className="min-h-[100px]"
                        {...field}
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
                    <FormLabel>Instructor (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter instructor name" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Leave blank if no instructor assigned yet
                    </FormDescription>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingCourse ? "Update Course" : "Add Course"}
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
