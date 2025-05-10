import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Department, useDepartmentStore } from "@/store/useDepartmentStore";
import { Faculty, useFacultyStore } from "@/store/useFacultyStore";

// Form schema
const departmentFormSchema = z.object({
  name: z.string().min(2, { message: "Department name is required" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  facultyId: z.string().min(1, { message: "Faculty is required" }),
  head: z.string().min(2, { message: "Department head name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(6, { message: "Phone number is required" }),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

const DepartmentsPage = () => {
  const {
    departments,
    fetchDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    isLoading,
  } = useDepartmentStore();
  const { faculties, fetchFaculties, isLoading: facultiesLoading } = useFacultyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );

  // Setup form
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      facultyId: "",
      head: "",
      email: "",
      phone: "",
    },
  });

  // Fetch departments and faculties on component mount
  useEffect(() => {
    fetchDepartments();
    fetchFaculties();
  }, [fetchDepartments, fetchFaculties]);

  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingDepartment(null);
    }
    setIsOpen(open);
  };

  // Handle form submission
  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      const selectedFaculty = faculties.find(
        (faculty) => faculty.id === data.facultyId,
      );
      const facultyName = selectedFaculty ? selectedFaculty.name : "Unknown Faculty";

      if (editingDepartment) {
        // Update existing department
        await updateDepartment(editingDepartment.id, {
          ...data,
          departmentHead: data.head,
          facultyName,
        });
        toast.success("Department updated successfully");
      } else {
        // Add new department
        await addDepartment({
          ...data,
          departmentHead: data.head,
          facultyName,
        });
        toast.success("Department added successfully");
      }
      handleDialogOpenChange(false);
    } catch (error) {
      toast.error("Failed to save department");
      console.error(error);
    }
  };

  // Handle edit department
  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.reset({
      name: department.name,
      description: department.description || "",
      facultyId: department.facultyId,
      head: department.departmentHead,
      email: department.email || "",
      phone: department.phone || "",
    });
    setIsOpen(true);
  };

  // Handle delete department
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this department? This action cannot be undone.")) {
      try {
        await deleteDepartment(id);
        toast.success("Department deleted successfully");
      } catch (error) {
        toast.error("Failed to delete department");
        console.error(error);
      }
    }
  };

  // Define columns
  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "facultyName",
      header: "Faculty",
    },
    {
      accessorKey: "departmentHead",
      header: "Department Head",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const department = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(department)}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(department.id)}
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
        title="Departments"
        description="Manage university departments"
        action={{
          label: "Add Department",
          icon: Plus,
          onClick: () => setIsOpen(true),
        }}
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading departments...</span>
          </div>
        ) : (
          <DataTable columns={columns} data={departments} />
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Edit Department" : "Add New Department"}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment
                ? "Update department information in the form below."
                : "Fill in the details to create a new department."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter department description"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {facultiesLoading ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading...
                          </div>
                        ) : faculties.length === 0 ? (
                          <div className="p-2 text-center text-muted-foreground">
                            No faculties found
                          </div>
                        ) : (
                          faculties.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="head"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Head</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter department head's name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      {editingDepartment ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    editingDepartment ? "Update Department" : "Add Department"
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

export default DepartmentsPage;
