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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Form schema
const departmentFormSchema = z.object({
  name: z.string().min(2, { message: "Department name is required" }),
  facultyId: z.string().min(1, { message: "Faculty is required" }),
  head: z.string().min(2, { message: "Department head name is required" }),
  phone: z.string().min(6, { message: "Phone number is required" }),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
  semester: z.string().optional(),
  batch: z.string().optional(),
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
      facultyId: "",
      head: "",
      phone: "",
      price: 0,
      semester: "",
      batch: "",
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

      if (editingDepartment) {
        // Update existing department
        await updateDepartment(editingDepartment.id, {
          name: data.name,
          facultyId: data.facultyId,
          departmentHead: data.head,
          price: data.price,
          semester: data.semester,
          batch: data.batch,
          phone: data.phone,
        });
        toast.success("Department updated successfully");
      } else {
        // Add new department
        await addDepartment({
          name: data.name,
          facultyId: data.facultyId,
          departmentHead: data.head,
          price: data.price,
          semester: data.semester,
          batch: data.batch,
          phone: data.phone,
        } as Omit<Department, "id">);
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
      facultyId: department.facultyId,
      head: department.departmentHead,
      phone: department.phone || "",
      price: department.price || 0,
      semester: department.semester || "",
      batch: department.batch || "",
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
      accessorKey: "price",
      header: "Tuition Price",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price") || "0");
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price);
      },
    },

    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "semester",
      header: "Semesters",
    },
    {
      accessorKey: "batch",
      header: "Batch",
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the department
                    record for {department.name} and remove its data from the system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(department.id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tuition Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                            <SelectValue placeholder="Select number of semesters" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="6">6 Semesters</SelectItem>
                          <SelectItem value="8">8 Semesters</SelectItem>
                          <SelectItem value="12">12 Semesters</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="batch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter batch (e.g. BI02)" {...field} />
                      </FormControl>
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
